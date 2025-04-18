
import { useState, useCallback } from 'react';
import { Node, Edge } from '@xyflow/react';
import { Graph } from '../utils/dijkstra';
import { toast } from 'sonner';
import { isPathCompromised, generateRandomAlert } from '../utils/ids';
import { simulateSHA256Hash } from '../utils/crypto';

export const useSimulationState = (graph: Graph, onPathChange: (path: string[], isCompromised: boolean) => void) => {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);
  const [currentPacketPosition, setCurrentPacketPosition] = useState(0);
  const [transmissionData] = useState("Secure transmission data");
  const [isAutoMode, setIsAutoMode] = useState(true);

  const handleNodeCompromise = useCallback(() => {
    if (!graph.nodes.find(n => n.isSender)?.id || !graph.nodes.find(n => n.isReceiver)?.id) return;
    
    // Don't compromise sender or receiver nodes
    const compromisedNode = compromiseRandomNode(
      graph.nodes, 
      [graph.nodes.find(n => n.isSender)!.id, graph.nodes.find(n => n.isReceiver)!.id]
    );
    
    if (compromisedNode) {
      // Generate an IDS alert
      const alert = generateRandomAlert(compromisedNode.id);
      onIdsAlert(compromisedNode.id, alert.severity);
      
      // Show a toast notification
      toast.error(`Node ${compromisedNode.label} has been compromised!`, {
        description: alert.message,
        duration: 5000,
      });
      
      // Recalculate the path to avoid the compromised node
      if (graph.nodes.find(n => n.isSender)?.id && graph.nodes.find(n => n.isReceiver)?.id) {
        findNewPath(graph.nodes.find(n => n.isSender)!.id, graph.nodes.find(n => n.isReceiver)!.id);
      }
    }
  }, [graph]);

  const findNewPath = useCallback((start: string, end: string) => {
    const result = findShortestPath(graph, start, end);
    setCurrentPath(result.path);
    
    // Check if the new path is compromised
    const isCompromised = isPathCompromised(result.path, graph.nodes);
    onPathChange(result.path, isCompromised);
  }, [graph, onPathChange]);

  const startSimulation = useCallback(() => {
    const senderNode = graph.nodes.find(n => n.isSender);
    const receiverNode = graph.nodes.find(n => n.isReceiver);
    
    if (!senderNode || !receiverNode) {
      toast.error("Sender or receiver node not found");
      return;
    }
    
    setIsSimulating(true);
    setSimulationStep(1);
    
    // Step 1: Find the shortest path using Dijkstra's algorithm
    findNewPath(senderNode.id, receiverNode.id);
    
    if (isAutoMode) {
      // Move to next step after a delay
      setTimeout(() => setSimulationStep(2), 3000);
    }
  }, [findNewPath, graph.nodes, isAutoMode]);

  const simulatePacketTransmission = useCallback(() => {
    if (currentPath.length === 0) return;
    
    setSimulationStep(3);
    const dataHash = simulateSHA256Hash(transmissionData);
    
    if (isAutoMode) {
      currentPath.forEach((nodeId, index) => {
        if (index < currentPath.length - 1) {
          setTimeout(() => {
            setCurrentPacketPosition(index);
            onNodeVisit(nodeId);
          }, index * 1000);
        }
      });
      
      setTimeout(() => {
        setSimulationStep(4);
        const isCompromised = isPathCompromised(currentPath, graph.nodes);
        onTransmissionComplete(!isCompromised, dataHash);
        
        if (Math.random() < 0.3) {
          setTimeout(handleNodeCompromise, 2000);
        }
      }, currentPath.length * 1000);
    }
  }, [currentPath, transmissionData, graph.nodes, isAutoMode, handleNodeCompromise]);

  const nextStep = useCallback(() => {
    if (isSimulating) {
      if (simulationStep === 1) {
        setSimulationStep(2);
      } else if (simulationStep === 2) {
        simulatePacketTransmission();
      } else if (simulationStep === 3) {
        setSimulationStep(4);
        const isCompromised = isPathCompromised(currentPath, graph.nodes);
        const dataHash = simulateSHA256Hash(transmissionData);
        onTransmissionComplete(!isCompromised, dataHash);
      } else if (simulationStep === 4) {
        setIsSimulating(false);
        setSimulationStep(0);
        setCurrentPacketPosition(0);
      }
    } else {
      startSimulation();
    }
  }, [isSimulating, simulationStep, startSimulation, simulatePacketTransmission, currentPath, graph.nodes, transmissionData]);

  const toggleAutoMode = useCallback(() => {
    setIsAutoMode(!isAutoMode);
    toast.info(`${!isAutoMode ? 'Auto' : 'Manual'} mode enabled`, {
      description: !isAutoMode 
        ? "The simulation will progress automatically" 
        : "Use the Next button to progress through steps",
      duration: 3000,
    });
  }, [isAutoMode]);

  const resetSimulation = useCallback(() => {
    setIsSimulating(false);
    setSimulationStep(0);
    setCurrentPacketPosition(0);
    setCurrentPath([]);
    
    toast.info("Simulation reset", {
      description: "All nodes restored to secure state",
      duration: 3000,
    });
  }, []);

  return {
    currentPath,
    isSimulating,
    simulationStep,
    currentPacketPosition,
    isAutoMode,
    handleNodeCompromise,
    nextStep,
    toggleAutoMode,
    resetSimulation
  };
};
