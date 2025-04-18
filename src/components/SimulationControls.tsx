
import React from 'react';
import { Button } from './ui/button';

interface SimulationControlsProps {
  isAutoMode: boolean;
  isSimulating: boolean;
  simulationStep: number;
  onNext: () => void;
  onIntrusion: () => void;
  onToggleMode: () => void;
  onReset: () => void;
}

const SimulationControls: React.FC<SimulationControlsProps> = ({
  isAutoMode,
  isSimulating,
  simulationStep,
  onNext,
  onIntrusion,
  onToggleMode,
  onReset
}) => {
  return (
    <div className="h-[60px] px-4 border-t border-border flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          onClick={onNext}
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
          onClick={onIntrusion}
          variant="destructive"
          disabled={isSimulating && simulationStep < 3}
        >
          Simulate Intrusion
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <Button onClick={onToggleMode} variant="outline">
          {isAutoMode ? "Switch to Manual" : "Switch to Auto"}
        </Button>
        
        <Button onClick={onReset} variant="outline">
          Reset
        </Button>
      </div>
    </div>
  );
};

export default SimulationControls;
