
import React, { useEffect, useState, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  BackgroundVariant,
  useEdgesState,
  useNodesState,
  Node,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './NetworkNode';
import PacketAnimation from './PacketAnimation';
import { useSimulationState } from '../hooks/useSimulationState';
import SimulationControls from './SimulationControls';
import { Graph } from '../utils/dijkstra';
import { graphToFlowNodes, graphToFlowEdges } from '../utils/flowUtils';

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
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [activeNodeIndex, setActiveNodeIndex] = useState(-1);
  const [showPacketAnimation, setShowPacketAnimation] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);

  const {
    currentPath,
    isSimulating,
    simulationStep,
    isAutoMode,
    handleNodeCompromise,
    nextStep,
    toggleAutoMode,
    resetSimulation
  } = useSimulationState({
    graph: initialGraph,
    onPathChange,
    onNodeVisit,
    onTransmissionComplete,
    onIdsAlert
  });

  // Initialize nodes and edges from the graph
  useEffect(() => {
    const flowNodes = graphToFlowNodes(initialGraph);
    const flowEdges = graphToFlowEdges(initialGraph);
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [initialGraph, setNodes, setEdges]);

  // Update nodes when path changes
  useEffect(() => {
    if (currentPath.length > 0 && simulationStep === 3) {
      const interval = setInterval(() => {
        setActiveNodeIndex(prev => {
          if (prev + 1 >= currentPath.length) {
            clearInterval(interval);
            setShowPacketAnimation(false);
            return -1;
          }
          const nodeId = currentPath[prev + 1];
          onNodeVisit(nodeId);
          setShowPacketAnimation(true);
          setAnimationKey(prev => prev + 1);
          return prev + 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentPath, simulationStep, onNodeVisit]);

  // Update node appearance based on active state
  useEffect(() => {
    setNodes(nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        isActive: currentPath[activeNodeIndex] === node.id
      }
    })));
  }, [activeNodeIndex, currentPath, setNodes]);

  return (
    <div className="w-full h-full">
      <div className="h-[calc(100%-60px)]">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={{ customNode: CustomNode }}
          fitView
          minZoom={0.2}
          maxZoom={2}
        >
          <Background 
            color="#444" 
            variant={BackgroundVariant.Dots} 
            gap={8} 
            size={1}
          />
          <Controls />
          {showPacketAnimation && activeNodeIndex >= 0 && activeNodeIndex < currentPath.length - 1 && (
            <PacketAnimation
              key={animationKey}
              sourceX={nodes.find(n => n.id === currentPath[activeNodeIndex])?.position.x || 0}
              sourceY={nodes.find(n => n.id === currentPath[activeNodeIndex])?.position.y || 0}
              targetX={nodes.find(n => n.id === currentPath[activeNodeIndex + 1])?.position.x || 0}
              targetY={nodes.find(n => n.id === currentPath[activeNodeIndex + 1])?.position.y || 0}
              isActive={true}
            />
          )}
        </ReactFlow>
      </div>
      
      <SimulationControls
        isAutoMode={isAutoMode}
        isSimulating={isSimulating}
        simulationStep={simulationStep}
        onNext={nextStep}
        onIntrusion={handleNodeCompromise}
        onToggleMode={toggleAutoMode}
        onReset={resetSimulation}
      />
    </div>
  );
};

export default NetworkGraph;
