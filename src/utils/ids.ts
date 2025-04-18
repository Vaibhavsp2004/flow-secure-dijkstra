// Intrusion Detection System simulation

import { Node } from './dijkstra';

export interface IDSAlert {
  id: string;
  timestamp: Date;
  nodeId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
}

// Generate a random IDS alert for a node
export const generateRandomAlert = (nodeId: string): IDSAlert => {
  const alertTypes = [
    { severity: 'low' as const, message: 'Unusual network traffic detected' },
    { severity: 'medium' as const, message: 'Multiple failed authentication attempts' },
    { severity: 'high' as const, message: 'Potential data exfiltration detected' },
    { severity: 'critical' as const, message: 'System compromise detected' }
  ];
  
  const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
  
  return {
    id: `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date(),
    nodeId,
    severity: alertType.severity,
    message: alertType.message
  };
};

// Simulate a node being compromised
export const compromiseRandomNode = (
  nodes: Node[],
  excludeIds: string[] = []
): Node | null => {
  // Filter out nodes that are already compromised or in the exclude list
  const eligibleNodes = nodes.filter(
    node => !node.isCompromised && !excludeIds.includes(node.id)
  );
  
  if (eligibleNodes.length === 0) return null;
  
  // Select a random node to compromise
  const nodeToCompromise = eligibleNodes[Math.floor(Math.random() * eligibleNodes.length)];
  nodeToCompromise.isCompromised = true;
  
  return nodeToCompromise;
};

// Check if a transmission path contains any compromised nodes
export const isPathCompromised = (path: string[], nodes: Node[]): boolean => {
  return path.some(nodeId => {
    const node = nodes.find(n => n.id === nodeId);
    return node?.isCompromised ?? false;
  });
};

// Get all compromised nodes from a list
export const getCompromisedNodes = (nodes: Node[]): Node[] => {
  return nodes.filter(node => node.isCompromised);
};
