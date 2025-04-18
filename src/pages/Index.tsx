
import React, { useEffect, useState } from 'react';
import { generateRandomGraph, Node, Edge, Graph } from '../utils/dijkstra';
import { simulateSHA256Hash } from '../utils/crypto';
import { generateRandomAlert } from '../utils/ids';
import { toast } from 'sonner';
import NetworkGraph from '../components/NetworkGraph';
import SimulationSidebar from '../components/SimulationSidebar';
import InfoPanel from '../components/InfoPanel';
import { Separator } from '@/components/ui/separator';
import { ReactFlowProvider } from '@xyflow/react';

interface LogEntry {
  id: string;
  type: 'ids' | 'key' | 'path' | 'info';
  message: string;
  timestamp: Date;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

const Index = () => {
  const [graph, setGraph] = useState<Graph>(() => generateRandomGraph(8, 0.4));
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [visitedNodes, setVisitedNodes] = useState<string[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [transmissionComplete, setTransmissionComplete] = useState(false);
  const [transmissionSuccess, setTransmissionSuccess] = useState(false);
  const [dataHash, setDataHash] = useState('');
  const [simulationStep, setSimulationStep] = useState(0);

  // Initialize with a welcome message
  useEffect(() => {
    addLog({
      type: 'info',
      message: 'Welcome to the Secure Network Transmission Simulator'
    });
  }, []);

  // Add a log entry
  const addLog = (log: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newLog: LogEntry = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date(),
      ...log
    };
    
    setLogs(prevLogs => [newLog, ...prevLogs].slice(0, 100)); // Keep only the latest 100 logs
  };

  // Handle path changes
  const handlePathChange = (path: string[], isCompromised: boolean) => {
    setCurrentPath(path);
    
    if (path.length > 0) {
      setSimulationStep(prev => Math.max(prev, 2));
      
      const senderNode = graph.nodes.find(node => node.isSender);
      const receiverNode = graph.nodes.find(node => node.isReceiver);
      
      addLog({
        type: 'path',
        message: `Path calculated from ${senderNode?.label || 'sender'} to ${receiverNode?.label || 'receiver'} with ${path.length} hops`
      });
      
      if (isCompromised) {
        addLog({
          type: 'ids',
          severity: 'high',
          message: 'Calculated path contains compromised nodes. Rerouting...'
        });
      }
    }
  };

  // Handle node visits during pathfinding
  const handleNodeVisit = (nodeId: string) => {
    const node = graph.nodes.find(n => n.id === nodeId);
    
    if (node && !visitedNodes.includes(nodeId)) {
      setVisitedNodes(prev => [...prev, nodeId]);
      
      addLog({
        type: 'info',
        message: `Visited node: ${node.label}`
      });
    }
  };

  // Handle transmission completion
  const handleTransmissionComplete = (success: boolean, hash: string) => {
    setTransmissionComplete(true);
    setTransmissionSuccess(success);
    setDataHash(hash);
    setSimulationStep(5);
    
    if (success) {
      addLog({
        type: 'info',
        message: 'Transmission completed successfully. Data integrity verified.'
      });
    } else {
      addLog({
        type: 'ids',
        severity: 'critical',
        message: 'Transmission compromised! Data integrity verification failed.'
      });
    }
  };

  // Handle IDS alerts
  const handleIdsAlert = (nodeId: string, severity: string) => {
    const node = graph.nodes.find(n => n.id === nodeId);
    
    if (node) {
      addLog({
        type: 'ids',
        severity: severity as 'low' | 'medium' | 'high' | 'critical',
        message: `Node ${node.label} compromised! Security breach detected.`
      });
      
      // If we're in the middle of a transmission, add a key rotation log
      if (simulationStep >= 3) {
        setTimeout(() => {
          addLog({
            type: 'key',
            message: 'DKMS initiated emergency key rotation for all nodes'
          });
        }, 1000);
      }
    }
  };

  return (
    <div className="h-screen w-full bg-background text-foreground flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h1 className="text-xl md:text-2xl font-bold text-center">
          Secure Network Transmission Simulator – Dijkstra Powered Security Routing
        </h1>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-80 border-r border-border md:h-full overflow-hidden order-2 md:order-1">
          <SimulationSidebar
            currentPath={currentPath}
            logs={logs}
            visitedNodes={visitedNodes}
            transmissionComplete={transmissionComplete}
            transmissionSuccess={transmissionSuccess}
            dataHash={dataHash}
            simulationStep={simulationStep}
          />
        </div>
        
        {/* Main graph area */}
        <div className="flex-1 overflow-hidden order-1 md:order-2">
          <ReactFlowProvider>
            <NetworkGraph
              initialGraph={graph}
              onPathChange={handlePathChange}
              onNodeVisit={handleNodeVisit}
              onTransmissionComplete={handleTransmissionComplete}
              onIdsAlert={handleIdsAlert}
            />
          </ReactFlowProvider>
        </div>
      </div>
      
      {/* Bottom info panel */}
      <div className="h-64 border-t border-border p-4">
        <InfoPanel simulationStep={simulationStep} />
      </div>
    </div>
  );
};

export default Index;
