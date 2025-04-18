
import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Edge,
  MarkerType,
  Node as FlowNode,
  NodeTypes,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { toast } from 'sonner';
import { findShortestPath, Node, Edge as GraphEdge, Graph } from '../utils/dijkstra';
import CustomNode from './NetworkNode';
import { simulateAESEncryption, simulateSHA256Hash } from '../utils/crypto';
import { compromiseRandomNode, generateRandomAlert, isPathCompromised } from '../utils/ids';
import { Button } from './ui/button';
import { ComputerIcon, Database, LockIcon, Smartphone, WifiIcon } from 'lucide-react';

// Define custom node types
const nodeTypes: NodeTypes = {
  customNode: CustomNode
};

// Helper function to map our graph model to React Flow nodes
const graphToFlowNodes = (graph: Graph): FlowNode[] => {
  return graph.nodes.map(node => {
    // Determine node icon based on type
    let icon;
    switch (node.type) {
      case 'server':
        icon = <Database className="h-5 w-5 text-node-server" />;
        break;
      case 'computer':
        icon = <ComputerIcon className="h-5 w-5 text-node-computer" />;
        break;
      case 'iot':
        icon = <Smartphone className="h-5 w-5 text-node-iot" />;
        break;
      default:
        icon = <WifiIcon className="h-5 w-5 text-white" />;
    }

    // Determine node styles based on status
    let nodeStyle: React.CSSProperties = {
      background: node.isCompromised ? '#2d1b1b' : '#1e1e2e',
      borderColor: node.isCompromised ? '#ef4444' : node.isSender ? '#22c55e' : node.isReceiver ? '#3b82f6' : '#6b7280',
      borderWidth: node.isSender || node.isReceiver ? '2px' : '1px',
      width: 100,
      height: 100,
    };

    return {
      id: node.id,
      position: { x: node.x, y: node.y },
      data: { 
        label: node.label, 
        isCompromised: node.isCompromised,
        isSender: node.isSender,
        isReceiver: node.isReceiver,
        icon,
        nodeType: node.type
      },
      type: 'customNode',
      style: nodeStyle,
    };
  });
};

// Helper function to map our graph model to React Flow edges
const graphToFlowEdges = (
  graph: Graph, 
  path: string[] = [],
  pathInProgress: boolean = false
): Edge[] => {
  return graph.edges.map(edge => {
    // Check if this edge is part of the current path
    const isInPath = path.length > 1 && 
      path.some((nodeId, index) => {
        if (index === path.length - 1) return false;
        return (
          (edge.from === nodeId && edge.to === path[index + 1]) ||
          (edge.to === nodeId && edge.from === path[index + 1])
        );
      });

    // Apply different styles to path edges
    const edgeStyle: React.CSSProperties = {
      stroke: isInPath ? '#9b87f5' : '#6b7280',
      strokeWidth: isInPath ? 3 : 1,
      opacity: isInPath ? 1 : 0.6,
    };

    const labelStyle: React.CSSProperties = {
      fill: isInPath ? '#fff' : '#aaa',
      fontSize: 10,
    };

    return {
      id: edge.id,
      source: edge.from,
      target: edge.to,
      style: edgeStyle,
      animated: isInPath && pathInProgress,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isInPath ? '#9b87f5' : '#6b7280',
      },
      label: `${edge.weight}`,
      labelStyle,
      data: {
        latency: edge.latency,
        encryptionOverhead: edge.encryptionOverhead,
        securityRisk: edge.securityRisk,
        type: edge.type
      }
    };
  });
};

interface NetworkGraphProps {
  initialGraph: Graph;
  onPathChange: (path: string[], isCompromised: boolean) => void;
  onNodeVisit: (nodeId: string) => void;
  onTransmissionComplete: (success: boolean, hash: string) => void;
  onIdsAlert: (nodeId: string, severity: string) => void;
}

const NetworkGraph: React.FC<NetworkGraphProps> = ({
  initialGraph,
  onPathChange,
  onNodeVisit,
  onTransmissionComplete,
  onIdsAlert
}) => {
  const [graph, setGraph] = useState<Graph>(initialGraph);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [senderNode, setSenderNode] = useState<string | null>(null);
  const [receiverNode, setReceiverNode] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [currentPacketPosition, setCurrentPacketPosition] = useState(0);
  const [transmissionData, setTransmissionData] = useState("Secure transmission data");
  const [isAutoMode, setIsAutoMode] = useState(true);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  const reactFlowInstance = useReactFlow();

  // Initialize the graph
  useEffect(() => {
    // Find sender and receiver nodes
    const sender = initialGraph.nodes.find(node => node.isSender);
    const receiver = initialGraph.nodes.find(node => node.isReceiver);
    
    if (sender) setSenderNode(sender.id);
    if (receiver) setReceiverNode(receiver.id);
    
    setGraph(initialGraph);
    setNodes(graphToFlowNodes(initialGraph));
    setEdges(graphToFlowEdges(initialGraph));
  }, [initialGraph, setNodes, setEdges]);

  // Update the graph when a node is compromised
  const handleNodeCompromise = useCallback(() => {
    if (!senderNode || !receiverNode) return;
    
    // Don't compromise sender or receiver nodes
    const compromisedNode = compromiseRandomNode(
      graph.nodes, 
      [senderNode, receiverNode]
    );
    
    if (compromisedNode) {
      // Generate an IDS alert
      const alert = generateRandomAlert(compromisedNode.id);
      onIdsAlert(compromisedNode.id, alert.severity);
      
      // Update the graph
      setGraph(prevGraph => ({
        ...prevGraph,
        nodes: prevGraph.nodes.map(node => 
          node.id === compromisedNode.id 
            ? { ...node, isCompromised: true } 
            : node
        )
      }));
      
      // Show a toast notification
      toast.error(`Node ${compromisedNode.label} has been compromised!`, {
        description: alert.message,
        duration: 5000,
      });
      
      // Recalculate the path to avoid the compromised node
      if (senderNode && receiverNode) {
        findNewPath(senderNode, receiverNode);
      }
    }
  }, [graph, senderNode, receiverNode, onIdsAlert]);

  // Find a new path after node compromise
  const findNewPath = useCallback((start: string, end: string) => {
    const result = findShortestPath(graph, start, end);
    setCurrentPath(result.path);
    
    // Check if the new path is compromised
    const isCompromised = isPathCompromised(result.path, graph.nodes);
    onPathChange(result.path, isCompromised);
    
    // Update the edges to highlight the new path
    setEdges(graphToFlowEdges(graph, result.path, true));
    
    // Visualize node visits
    if (isAutoMode) {
      result.visitOrder.forEach((nodeId, index) => {
        setTimeout(() => {
          onNodeVisit(nodeId);
          // Highlight the visited nodes
          setNodes(nds => 
            nds.map(node => 
              node.id === nodeId
                ? { 
                    ...node, 
                    style: { 
                      ...node.style, 
                      boxShadow: '0 0 10px #10b981',
                      transition: 'all 0.3s ease'
                    } 
                  }
                : node
            )
          );
        }, index * 500);
      });
    }
  }, [graph, onPathChange, onNodeVisit, setEdges, setNodes, isAutoMode]);

  // Start the simulation
  const startSimulation = useCallback(() => {
    if (!senderNode || !receiverNode) {
      toast.error("Sender or receiver node not found");
      return;
    }
    
    setIsSimulating(true);
    setSimulationStep(1);
    
    // Step 1: Find the shortest path using Dijkstra's algorithm
    findNewPath(senderNode, receiverNode);
    
    if (isAutoMode) {
      // Move to next step after a delay
      setTimeout(() => setSimulationStep(2), 3000);
    }
  }, [senderNode, receiverNode, findNewPath, isAutoMode]);

  // Handle encryption and transmission
  const simulatePacketTransmission = useCallback(() => {
    if (currentPath.length === 0) return;
    
    setSimulationStep(3);
    
    // Encrypt the data
    const encryptedData = simulateAESEncryption(transmissionData);
    const dataHash = simulateSHA256Hash(transmissionData);
    
    // Animate packet transmission through the path
    if (isAutoMode) {
      currentPath.forEach((nodeId, index) => {
        if (index < currentPath.length - 1) {
          setTimeout(() => {
            setCurrentPacketPosition(index);
            onNodeVisit(nodeId);
            
            // Highlight the current node
            setNodes(nds => 
              nds.map(node => 
                node.id === nodeId
                  ? { 
                      ...node, 
                      style: { 
                        ...node.style, 
                        boxShadow: '0 0 15px #9b87f5',
                        transition: 'all 0.3s ease'
                      } 
                    }
                  : node
              )
            );
          }, index * 1000);
        }
      });
      
      // Complete transmission
      setTimeout(() => {
        setSimulationStep(4);
        
        // Check if path is compromised
        const isCompromised = isPathCompromised(currentPath, graph.nodes);
        
        if (isCompromised) {
          // If compromised, show tampering message
          toast.error("Transmission compromised!", {
            description: "Data integrity verification failed. Hash mismatch detected.",
            duration: 5000,
          });
          onTransmissionComplete(false, dataHash);
        } else {
          // If secure, show success message
          toast.success("Transmission complete!", {
            description: "Data integrity verified. Hash matches original data.",
            duration: 5000,
          });
          onTransmissionComplete(true, dataHash);
        }
        
        // Random chance to compromise a node after transmission
        if (Math.random() < 0.3) {
          setTimeout(handleNodeCompromise, 2000);
        }
      }, currentPath.length * 1000);
    }
  }, [
    currentPath, 
    transmissionData, 
    onNodeVisit, 
    onTransmissionComplete, 
    setNodes, 
    graph.nodes, 
    handleNodeCompromise,
    isAutoMode
  ]);

  // Advance to the next step manually
  const nextStep = useCallback(() => {
    if (isSimulating) {
      if (simulationStep === 1) {
        setSimulationStep(2);
      } else if (simulationStep === 2) {
        simulatePacketTransmission();
      } else if (simulationStep === 3) {
        setSimulationStep(4);
        
        // Check if path is compromised
        const isCompromised = isPathCompromised(currentPath, graph.nodes);
        const dataHash = simulateSHA256Hash(transmissionData);
        
        if (isCompromised) {
          toast.error("Transmission compromised!", {
            description: "Data integrity verification failed. Hash mismatch detected.",
            duration: 5000,
          });
          onTransmissionComplete(false, dataHash);
        } else {
          toast.success("Transmission complete!", {
            description: "Data integrity verified. Hash matches original data.",
            duration: 5000,
          });
          onTransmissionComplete(true, dataHash);
        }
      } else if (simulationStep === 4) {
        // Reset simulation
        setIsSimulating(false);
        setSimulationStep(0);
        setCurrentPacketPosition(0);
        
        // Reset node styles
        setNodes(graphToFlowNodes(graph));
        setEdges(graphToFlowEdges(graph));
      }
    } else {
      startSimulation();
    }
  }, [
    isSimulating, 
    simulationStep, 
    startSimulation, 
    simulatePacketTransmission, 
    currentPath, 
    graph, 
    transmissionData, 
    onTransmissionComplete, 
    setNodes, 
    setEdges
  ]);

  // Trigger an intrusion for demo purposes
  const triggerIntrusion = useCallback(() => {
    handleNodeCompromise();
  }, [handleNodeCompromise]);

  // Toggle auto/manual mode
  const toggleAutoMode = useCallback(() => {
    setIsAutoMode(!isAutoMode);
    toast.info(`${!isAutoMode ? 'Auto' : 'Manual'} mode enabled`, {
      description: !isAutoMode 
        ? "The simulation will progress automatically" 
        : "Use the Next button to progress through steps",
      duration: 3000,
    });
  }, [isAutoMode]);

  // Reset the simulation
  const resetSimulation = useCallback(() => {
    setIsSimulating(false);
    setSimulationStep(0);
    setCurrentPacketPosition(0);
    
    // Reset the graph nodes (remove compromised status)
    const resetGraph = {
      ...graph,
      nodes: graph.nodes.map(node => ({
        ...node,
        isCompromised: false
      }))
    };
    
    setGraph(resetGraph);
    setNodes(graphToFlowNodes(resetGraph));
    setEdges(graphToFlowEdges(resetGraph));
    setCurrentPath([]);
    
    toast.info("Simulation reset", {
      description: "All nodes restored to secure state",
      duration: 3000,
    });
  }, [graph, setNodes, setEdges]);

  return (
    <div className="w-full h-full">
      <div className="h-[calc(100%-60px)]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={2}
        >
          <Background color="#444" variant="dots" />
          <Controls />
        </ReactFlow>
      </div>
      
      <div className="h-[60px] px-4 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={nextStep}
            className="bg-primary hover:bg-primary/90"
            disabled={isAutoMode && isSimulating}
          >
            {isSimulating ? `Next: ${
              simulationStep === 1 ? "Simulate Routing" :
              simulationStep === 2 ? "Start Transmission" :
              simulationStep === 3 ? "Verify Integrity" : "Reset"
            }` : "Start Simulation"}
          </Button>
          
          <Button
            onClick={triggerIntrusion}
            variant="destructive"
            disabled={isSimulating && simulationStep < 3}
          >
            Simulate Intrusion
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={toggleAutoMode} variant="outline">
            {isAutoMode ? "Switch to Manual" : "Switch to Auto"}
          </Button>
          
          <Button onClick={resetSimulation} variant="outline">
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NetworkGraph;
