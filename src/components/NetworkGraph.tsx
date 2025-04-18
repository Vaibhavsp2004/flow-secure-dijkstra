
import React, { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Edge,
  MarkerType,
  useEdgesState,
  useNodesState,
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import CustomNode from './NetworkNode';
import { useSimulationState } from '../hooks/useSimulationState';
import SimulationControls from './SimulationControls';
import { findShortestPath, Node as GraphNode, Edge as GraphEdge, Graph } from '../utils/dijkstra';

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
  const [graph, setGraph] = useState<Graph>(initialGraph);

  const {
    currentPath,
    isSimulating,
    simulationStep,
    isAutoMode,
    handleNodeCompromise,
    nextStep,
    toggleAutoMode,
    resetSimulation
  } = useSimulationState(graph, onPathChange);

  // Initialize the graph
  useEffect(() => {
    setGraph(initialGraph);
    setNodes(graphToFlowNodes(initialGraph));
    setEdges(graphToFlowEdges(initialGraph));
  }, [initialGraph, setNodes, setEdges]);

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
