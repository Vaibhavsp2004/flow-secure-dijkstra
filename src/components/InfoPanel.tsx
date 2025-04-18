
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { ShieldIcon, NetworkIcon, KeyIcon, HashIcon, ActivityIcon } from 'lucide-react';

interface InfoPanelProps {
  simulationStep: number;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ simulationStep }) => {
  return (
    <Card className="w-full h-full shadow-md border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Simulation Guide</CardTitle>
        <CardDescription>
          Follow the 5-step process of secure network transmission
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="overview">
          <TabsList className="w-full justify-start px-4 pt-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="steps">Steps</TabsTrigger>
            <TabsTrigger value="terms">Key Terms</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="px-4 pb-4">
            <ScrollArea className="h-[200px] pr-3">
              <div className="space-y-4 text-sm">
                <p>
                  This simulator demonstrates how data is securely transmitted across a network using
                  Dijkstra's algorithm for routing, combined with encryption and intrusion detection.
                </p>
                
                <div className="grid grid-cols-5 gap-2 text-xs">
                  <div className={`p-2 rounded-md text-center ${simulationStep >= 1 ? 'bg-primary/20' : 'bg-secondary/50'}`}>
                    <NetworkIcon className="h-5 w-5 mx-auto mb-1" />
                    <div>Network Topology</div>
                  </div>
                  
                  <div className={`p-2 rounded-md text-center ${simulationStep >= 2 ? 'bg-primary/20' : 'bg-secondary/50'}`}>
                    <ActivityIcon className="h-5 w-5 mx-auto mb-1" />
                    <div>Dijkstra Routing</div>
                  </div>
                  
                  <div className={`p-2 rounded-md text-center ${simulationStep >= 3 ? 'bg-primary/20' : 'bg-secondary/50'}`}>
                    <KeyIcon className="h-5 w-5 mx-auto mb-1" />
                    <div>Encryption</div>
                  </div>
                  
                  <div className={`p-2 rounded-md text-center ${simulationStep >= 4 ? 'bg-primary/20' : 'bg-secondary/50'}`}>
                    <ShieldIcon className="h-5 w-5 mx-auto mb-1" />
                    <div>IDS Protection</div>
                  </div>
                  
                  <div className={`p-2 rounded-md text-center ${simulationStep >= 5 ? 'bg-primary/20' : 'bg-secondary/50'}`}>
                    <HashIcon className="h-5 w-5 mx-auto mb-1" />
                    <div>Verification</div>
                  </div>
                </div>
                
                <p>
                  The simulator has two modes:
                </p>
                
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Auto Mode:</strong> The simulation runs automatically through all steps</li>
                  <li><strong>Manual Mode:</strong> You control the progression through each step</li>
                </ul>
                
                <p>
                  You can also trigger a node intrusion at any time to see how the system
                  responds by recalculating the path and updating security measures.
                </p>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="steps" className="px-4 pb-4">
            <ScrollArea className="h-[200px] pr-3">
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-medium flex items-center">
                    <span className="bg-secondary w-5 h-5 rounded-full inline-flex items-center justify-center mr-2 text-xs">1</span>
                    Graph Construction (Network Topology)
                  </h3>
                  <p className="text-muted-foreground text-xs pl-7 mt-1">
                    The simulator creates a network of devices (servers, computers, IoT) connected by various
                    link types (WiFi, Ethernet, 5G). Each connection has properties like latency, encryption
                    overhead, and security risk.
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium flex items-center">
                    <span className="bg-secondary w-5 h-5 rounded-full inline-flex items-center justify-center mr-2 text-xs">2</span>
                    Routing with Dijkstra's Algorithm
                  </h3>
                  <p className="text-muted-foreground text-xs pl-7 mt-1">
                    Dijkstra's algorithm calculates the optimal path from sender to receiver based on the
                    combined weights of latency, encryption overhead, and security risk. The path with
                    the lowest total weight is selected.
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium flex items-center">
                    <span className="bg-secondary w-5 h-5 rounded-full inline-flex items-center justify-center mr-2 text-xs">3</span>
                    Encryption & Data Transmission
                  </h3>
                  <p className="text-muted-foreground text-xs pl-7 mt-1">
                    Data is encrypted using AES-256 encryption and transmitted as secure packets along 
                    the optimal path. The encryption ensures data confidentiality as it moves through
                    the network.
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium flex items-center">
                    <span className="bg-secondary w-5 h-5 rounded-full inline-flex items-center justify-center mr-2 text-xs">4</span>
                    IDS & Dynamic Key Management
                  </h3>
                  <p className="text-muted-foreground text-xs pl-7 mt-1">
                    The Intrusion Detection System (IDS) monitors for compromised nodes. If detected,
                    the system reroutes data in real-time using Dijkstra's algorithm to find a new
                    secure path. The Dynamic Key Management System (DKMS) updates encryption keys.
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium flex items-center">
                    <span className="bg-secondary w-5 h-5 rounded-full inline-flex items-center justify-center mr-2 text-xs">5</span>
                    Data Integrity Verification
                  </h3>
                  <p className="text-muted-foreground text-xs pl-7 mt-1">
                    Upon arrival at the receiver, the data's integrity is verified using SHA-256 hashing.
                    The hash calculated at the source is compared with the hash at the destination to
                    ensure no tampering occurred during transmission.
                  </p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="terms" className="px-4 pb-4">
            <ScrollArea className="h-[200px] pr-3">
              <div className="space-y-3 text-sm">
                <div>
                  <h3 className="font-medium">Dijkstra's Algorithm</h3>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    A graph search algorithm that finds the shortest path between nodes. In this simulator,
                    it's used to find the most secure and efficient route for data transmission.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">AES-256</h3>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Advanced Encryption Standard with a 256-bit key length, a symmetric encryption
                    algorithm used to secure data during transmission.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">RSA-2048</h3>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    An asymmetric encryption algorithm using 2048-bit keys, primarily used for secure
                    key exchange and digital signatures.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">IDS (Intrusion Detection System)</h3>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    A system that monitors network traffic for suspicious activity and policy violations,
                    alerting when potential intrusions are detected.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">DKMS (Dynamic Key Management System)</h3>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    A system that handles the generation, exchange, storage, and replacement of
                    cryptographic keys to maintain security over time.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-medium">SHA-256</h3>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    A cryptographic hash function that generates a unique 256-bit (32-byte) signature
                    for a text, used for data integrity verification.
                  </p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default InfoPanel;
