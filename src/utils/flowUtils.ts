
import { Node as FlowNode, Edge as FlowEdge } from '@xyflow/react';
import { Node, Edge, Graph } from './dijkstra';
import { ComputerIcon, ServerIcon, RouterIcon, WifiIcon } from 'lucide-react';

// Convert graph nodes to ReactFlow nodes
export const graphToFlowNodes = (graph: Graph): FlowNode[] => {
  return graph.nodes.map(node => {
    // Determine node icon based on type
    const getNodeIcon = () => {
      switch (node.type) {
        case 'server':
          return <ServerIcon className="w-6 h-6 text-blue-400" />;
        case 'computer':
          return <ComputerIcon className="w-6 h-6 text-green-400" />;
        case 'router':
          return <RouterIcon className="w-6 h-6 text-purple-400" />;
        case 'iot':
          return <WifiIcon className="w-6 h-6 text-orange-400" />;
        default:
          return <ServerIcon className="w-6 h-6 text-blue-400" />;
      }
    };

    return {
      id: node.id,
      position: { x: node.x, y: node.y },
      type: 'customNode',
      data: {
        label: node.label,
        icon: getNodeIcon(),
        isCompromised: node.isCompromised || false,
        isSender: node.isSender || false,
        isReceiver: node.isReceiver || false,
        nodeType: node.type
      }
    };
  });
};

// Convert graph edges to ReactFlow edges
export const graphToFlowEdges = (graph: Graph): FlowEdge[] => {
  return graph.edges.map(edge => {
    // Determine edge style based on type
    const getEdgeStyle = () => {
      switch (edge.type) {
        case 'wifi':
          return { stroke: '#90cdf4', strokeWidth: 2, strokeDasharray: '5 5' };
        case 'ethernet':
          return { stroke: '#9ae6b4', strokeWidth: 3 };
        case '5g':
          return { stroke: '#fbd38d', strokeWidth: 2, strokeDasharray: '3 3' };
        case 'fiber':
          return { stroke: '#d6bcfa', strokeWidth: 4 };
        default:
          return { stroke: '#a0aec0', strokeWidth: 2 };
      }
    };

    return {
      id: edge.id,
      source: edge.from,
      target: edge.to,
      style: getEdgeStyle(),
      animated: false,
      label: `${edge.type} (${edge.weight})`,
      type: 'step',
      markerEnd: {
        type: 'arrow',
        width: 15,
        height: 15
      }
    };
  });
};
