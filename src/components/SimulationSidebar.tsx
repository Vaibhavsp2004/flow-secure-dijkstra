
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { LockIcon, LockOpenIcon, KeyIcon, AlertCircleIcon, ActivityIcon, ArrowRightIcon } from 'lucide-react';
import { Separator } from './ui/separator';

interface LogEntry {
  id: string;
  type: 'ids' | 'key' | 'path' | 'info';
  message: string;
  timestamp: Date;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}

interface SimulationSidebarProps {
  currentPath: string[];
  logs: LogEntry[];
  visitedNodes: string[];
  transmissionComplete: boolean;
  transmissionSuccess: boolean;
  dataHash: string;
  simulationStep: number;
}

const SimulationSidebar: React.FC<SimulationSidebarProps> = ({
  currentPath,
  logs,
  visitedNodes,
  transmissionComplete,
  transmissionSuccess,
  dataHash,
  simulationStep
}) => {
  // Format the timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Get log icon based on type
  const getLogIcon = (type: string, severity?: string) => {
    switch (type) {
      case 'ids':
        return (
          <AlertCircleIcon 
            className={`h-4 w-4 ${
              severity === 'critical' ? 'text-red-500' : 
              severity === 'high' ? 'text-orange-500' :
              severity === 'medium' ? 'text-yellow-500' : 'text-blue-500'
            }`} 
          />
        );
      case 'key':
        return <KeyIcon className="h-4 w-4 text-purple-500" />;
      case 'path':
        return <ArrowRightIcon className="h-4 w-4 text-blue-500" />;
      default:
        return <ActivityIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="h-full w-full flex flex-col gap-4 p-4 overflow-hidden bg-background">
      <Card className="flex-shrink-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <span className="mr-2">Simulation Status</span>
            <Badge variant={simulationStep > 0 ? "default" : "outline"}>
              {simulationStep === 0 ? 'Ready' : 
               simulationStep === 1 ? 'Pathfinding' : 
               simulationStep === 2 ? 'Routing' : 
               simulationStep === 3 ? 'Transmitting' : 
               simulationStep === 4 ? 'Verifying' : 'Complete'}
            </Badge>
          </CardTitle>
          <CardDescription>
            {simulationStep === 0 ? 'Press Start to begin the simulation' : 
             simulationStep === 1 ? 'Finding optimal path using Dijkstra\'s algorithm' : 
             simulationStep === 2 ? 'Route selected, preparing for transmission' : 
             simulationStep === 3 ? 'Transmitting encrypted data packets' : 
             simulationStep === 4 ? 'Verifying data integrity' : 'Simulation complete'}
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="path" className="flex-1 overflow-hidden">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="path">Routing</TabsTrigger>
          <TabsTrigger value="encryption">Security</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="path" className="h-[calc(100%-40px)] overflow-hidden">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Dijkstra's Algorithm Results</CardTitle>
              <CardDescription>
                {currentPath.length > 0 
                  ? `Path length: ${currentPath.length} nodes | Visited: ${visitedNodes.length} nodes` 
                  : 'No path calculated yet'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              <ScrollArea className="h-[300px] pr-3">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Optimal Path</h4>
                    {currentPath.length > 0 ? (
                      <div className="bg-secondary/50 p-2 rounded-md text-xs">
                        {currentPath.map((nodeId, index) => (
                          <div key={nodeId} className="flex items-center">
                            <span className="bg-primary/20 px-2 py-1 rounded-sm">{nodeId}</span>
                            {index < currentPath.length - 1 && (
                              <ArrowRightIcon className="h-3 w-3 mx-1" />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">Path will appear here</div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Visited Nodes</h4>
                    <div className="flex flex-wrap gap-1">
                      {visitedNodes.map((nodeId) => (
                        <Badge key={nodeId} variant="outline" className="text-xs">
                          {nodeId}
                        </Badge>
                      ))}
                      {visitedNodes.length === 0 && (
                        <div className="text-xs text-muted-foreground">No nodes visited yet</div>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="encryption" className="h-[calc(100%-40px)] overflow-hidden">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Security Status</CardTitle>
              <CardDescription>
                {transmissionComplete 
                  ? transmissionSuccess 
                    ? 'Transmission verified - data integrity preserved' 
                    : 'Transmission compromised - data integrity violation' 
                  : 'Waiting for transmission'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              <ScrollArea className="h-[300px] pr-3">
                <div className="space-y-4">
                  <div className="bg-secondary/50 p-3 rounded-md">
                    <h4 className="text-xs font-medium mb-2 flex items-center">
                      <LockIcon className="h-3 w-3 mr-1" />
                      Encryption Status
                    </h4>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="bg-primary/20">AES-256</Badge>
                      <Badge variant="outline" className="bg-primary/20">RSA-2048</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {simulationStep >= 3 
                        ? 'Data packets encrypted and in transit' 
                        : 'Waiting for transmission to begin'}
                    </div>
                  </div>
                  
                  <div className="bg-secondary/50 p-3 rounded-md">
                    <h4 className="text-xs font-medium mb-2 flex items-center">
                      <KeyIcon className="h-3 w-3 mr-1" />
                      Key Management
                    </h4>
                    <div className="text-xs">
                      {simulationStep >= 3 ? (
                        <>
                          <div className="flex items-center gap-1 text-green-500 mb-1">
                            <LockIcon className="h-3 w-3" />
                            <span>Secure key exchange complete</span>
                          </div>
                          <div className="text-muted-foreground">
                            DKMS active - Keys rotated every 5 minutes
                          </div>
                        </>
                      ) : (
                        <span className="text-muted-foreground">Keys will be generated during transmission</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-secondary/50 p-3 rounded-md">
                    <h4 className="text-xs font-medium mb-2">Data Integrity Verification</h4>
                    {transmissionComplete ? (
                      <div>
                        <div className={`text-xs flex items-center gap-1 ${transmissionSuccess ? 'text-green-500' : 'text-red-500'}`}>
                          {transmissionSuccess 
                            ? <LockIcon className="h-3 w-3" /> 
                            : <LockOpenIcon className="h-3 w-3" />}
                          <span>{transmissionSuccess ? 'Integrity verified' : 'Integrity compromised'}</span>
                        </div>
                        <div className="mt-2 text-[10px] font-mono bg-background/70 p-1 rounded border border-border">
                          <div>Hash: {dataHash.substring(0, 16)}...{dataHash.substring(dataHash.length - 4)}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        Waiting for transmission to complete
                      </div>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="h-[calc(100%-40px)] overflow-hidden">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">System Logs</CardTitle>
              <CardDescription>
                Real-time events and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[300px]">
                <div className="space-y-1 p-3">
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <div key={log.id} className="flex items-start gap-2 py-1 text-xs">
                        <div className="pt-0.5 flex-shrink-0">
                          {getLogIcon(log.type, log.severity)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate">
                              {log.type === 'ids' ? 'IDS Alert' : 
                               log.type === 'key' ? 'Key Management' : 
                               log.type === 'path' ? 'Path Update' : 'System'}
                            </span>
                            {log.type === 'ids' && (
                              <Badge 
                                variant="outline" 
                                className={`text-[10px] ${
                                  log.severity === 'critical' ? 'bg-red-500/20 text-red-500' : 
                                  log.severity === 'high' ? 'bg-orange-500/20 text-orange-500' :
                                  log.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-500' : 
                                  'bg-blue-500/20 text-blue-500'
                                }`}
                              >
                                {log.severity}
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-[10px]">{formatTime(log.timestamp)}</p>
                          <p className="mt-0.5">{log.message}</p>
                          <Separator className="my-1" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No logs yet. Start the simulation to see activity.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SimulationSidebar;
