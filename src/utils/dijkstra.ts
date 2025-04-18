
// Graph type definitions
export type NodeType = 'server' | 'computer' | 'iot' | 'router';
export type EdgeType = 'wifi' | 'ethernet' | '5g' | 'fiber';

export interface Node {
  id: string;
  label: string;
  type: NodeType;
  x: number;
  y: number;
  isCompromised?: boolean;
  isSender?: boolean;
  isReceiver?: boolean;
}

export interface Edge {
  id: string;
  from: string;
  to: string;
  type: EdgeType;
  latency: number;
  encryptionOverhead: number;
  securityRisk: number;
  weight: number;
}

export interface Graph {
  nodes: Node[];
  edges: Edge[];
}

export interface DijkstraResult {
  distances: Record<string, number>;
  previous: Record<string, string | null>;
  visitedNodes: string[];
  visitOrder: string[];
  path: string[];
}

// Calculate weight based on edge properties
export const calculateWeight = (edge: Omit<Edge, 'weight' | 'id'>): number => {
  return edge.latency + edge.encryptionOverhead + (edge.securityRisk * 2);
};

// Find the optimal path using Dijkstra's algorithm
export const findShortestPath = (
  graph: Graph,
  startNodeId: string,
  endNodeId: string
): DijkstraResult => {
  const nodes = graph.nodes;
  const edges = graph.edges;
  
  // Initialize distances with Infinity for all nodes except start node
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited: Set<string> = new Set();
  const visitedNodes: string[] = [];
  const visitOrder: string[] = [];
  
  // Initialize all nodes
  nodes.forEach(node => {
    distances[node.id] = node.id === startNodeId ? 0 : Infinity;
    previous[node.id] = null;
    unvisited.add(node.id);
  });
  
  // Process nodes until we visit all or find the destination
  while (unvisited.size > 0) {
    // Find the unvisited node with the minimum distance
    let currentNodeId: string | null = null;
    let minDistance = Infinity;
    
    unvisited.forEach(nodeId => {
      if (distances[nodeId] < minDistance) {
        minDistance = distances[nodeId];
        currentNodeId = nodeId;
      }
    });
    
    // If no accessible nodes left or we reached our destination, break
    if (currentNodeId === null || currentNodeId === endNodeId) break;
    
    // Mark current node as visited
    unvisited.delete(currentNodeId);
    visitedNodes.push(currentNodeId);
    visitOrder.push(currentNodeId);
    
    // Find outgoing edges from the current node
    const outgoingEdges = edges.filter(
      edge => edge.from === currentNodeId || edge.to === currentNodeId
    );
    
    // Update distances to neighboring nodes
    outgoingEdges.forEach(edge => {
      const neighborId = edge.from === currentNodeId ? edge.to : edge.from;
      
      // Skip this neighbor if it's already visited
      if (!unvisited.has(neighborId)) return;
      
      // Skip compromised nodes
      const neighborNode = nodes.find(node => node.id === neighborId);
      if (neighborNode?.isCompromised) return;
      
      // Calculate new distance
      const newDistance = distances[currentNodeId!] + edge.weight;
      
      // Update if new distance is shorter
      if (newDistance < distances[neighborId]) {
        distances[neighborId] = newDistance;
        previous[neighborId] = currentNodeId;
      }
    });
  }
  
  // Reconstruct path from end to start
  const path: string[] = [];
  let current = endNodeId;
  
  while (current && previous[current] !== null) {
    path.unshift(current);
    current = previous[current]!;
  }
  
  // Add start node to the beginning of the path
  if (path.length > 0 || startNodeId === endNodeId) {
    path.unshift(startNodeId);
  }
  
  return {
    distances,
    previous,
    visitedNodes,
    visitOrder,
    path
  };
};

// Generate a random network graph
export const generateRandomGraph = (
  nodeCount: number = 8,
  edgeDensity: number = 0.3
): Graph => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const nodeTypes: NodeType[] = ['server', 'computer', 'iot', 'router'];
  const edgeTypes: EdgeType[] = ['wifi', 'ethernet', '5g', 'fiber'];
  
  // Create nodes
  for (let i = 0; i < nodeCount; i++) {
    const nodeType = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
    const angleStep = (2 * Math.PI) / nodeCount;
    const angle = i * angleStep;
    const radius = 200;
    
    // Calculate position in a circle
    const x = radius * Math.cos(angle) + radius + 50;
    const y = radius * Math.sin(angle) + radius + 50;
    
    nodes.push({
      id: `node-${i}`,
      label: `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} ${i + 1}`,
      type: nodeType,
      x,
      y,
      isCompromised: false
    });
  }
  
  // Set sender and receiver nodes
  nodes[0].isSender = true;
  nodes[Math.floor(nodeCount / 2)].isReceiver = true;
  
  // Create edges
  for (let i = 0; i < nodes.length; i++) {
    // Connect each node to 2-4 others based on edgeDensity
    const connectionsCount = Math.floor(2 + Math.random() * 3 * edgeDensity);
    
    for (let j = 0; j < connectionsCount; j++) {
      // Select a random node that's not the current one
      let toIndex = Math.floor(Math.random() * nodes.length);
      while (toIndex === i || edges.some(e => 
        (e.from === nodes[i].id && e.to === nodes[toIndex].id) || 
        (e.from === nodes[toIndex].id && e.to === nodes[i].id)
      )) {
        toIndex = Math.floor(Math.random() * nodes.length);
      }
      
      const edgeType = edgeTypes[Math.floor(Math.random() * edgeTypes.length)];
      const latency = Math.floor(Math.random() * 10) + 1;
      const encryptionOverhead = Math.floor(Math.random() * 5) + 1;
      const securityRisk = Math.floor(Math.random() * 10) + 1;
      
      const edge: Edge = {
        id: `edge-${i}-${toIndex}`,
        from: nodes[i].id,
        to: nodes[toIndex].id,
        type: edgeType,
        latency,
        encryptionOverhead,
        securityRisk,
        weight: latency + encryptionOverhead + (securityRisk * 2)
      };
      
      edges.push(edge);
    }
  }
  
  // Ensure graph is connected by making sure each node has at least one edge
  for (let i = 0; i < nodes.length; i++) {
    const nodeId = nodes[i].id;
    const hasEdge = edges.some(e => e.from === nodeId || e.to === nodeId);
    
    if (!hasEdge) {
      // Connect to the next node
      const toIndex = (i + 1) % nodes.length;
      const edgeType = edgeTypes[Math.floor(Math.random() * edgeTypes.length)];
      const latency = Math.floor(Math.random() * 10) + 1;
      const encryptionOverhead = Math.floor(Math.random() * 5) + 1;
      const securityRisk = Math.floor(Math.random() * 10) + 1;
      
      const edge: Edge = {
        id: `edge-${i}-${toIndex}`,
        from: nodeId,
        to: nodes[toIndex].id,
        type: edgeType,
        latency,
        encryptionOverhead,
        securityRisk,
        weight: latency + encryptionOverhead + (securityRisk * 2)
      };
      
      edges.push(edge);
    }
  }
  
  return { nodes, edges };
};
