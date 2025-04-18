import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { ComputerIcon, ServerIcon, RouterIcon, WifiIcon, LockIcon, ShieldAlertIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface NodeData {
  label: string;
  iconClass: string;
  isCompromised?: boolean;
  isSender?: boolean;
  isReceiver?: boolean;
  nodeType: string;
}

const nodeIconMap = {
  server: ServerIcon,
  computer: ComputerIcon,
  router: RouterIcon,
  iot: WifiIcon
};

const NetworkNode = ({ data, selected }: { data: NodeData; selected: boolean }) => {
  const { label, iconClass, isCompromised, isSender, isReceiver, nodeType } = data;
  const NodeIcon = nodeIconMap[nodeType as keyof typeof nodeIconMap] || ServerIcon;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-2 rounded-xl border relative",
        isCompromised ? "border-red-500" : selected ? "border-blue-500" : "border-gray-600",
        isCompromised ? "animate-pulse bg-opacity-20 bg-red-900" : ""
      )}
      data-tooltip-id="node-tooltip"
      data-tooltip-content={`${nodeType.toUpperCase()} Node: ${label}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-gray-700 border-2 border-gray-500"
      />
      
      <div className="flex items-center justify-center w-full h-full">
        <div className="flex flex-col items-center gap-2 p-2">
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center",
            isSender ? "bg-green-900/30" : isReceiver ? "bg-blue-900/30" : "bg-gray-800/50",
            isCompromised ? "neon-red" : isSender ? "neon-green" : isReceiver ? "neon-primary" : ""
          )}>
            <NodeIcon className={iconClass} />
          </div>
          
          <div className="text-xs font-medium text-gray-300 max-w-[80px] truncate text-center">
            {label}
          </div>
          
          {isSender && (
            <div className="absolute -top-2 -right-2 bg-green-600 text-white text-[8px] px-1 py-0.5 rounded-sm">
              SENDER
            </div>
          )}
          
          {isReceiver && (
            <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-[8px] px-1 py-0.5 rounded-sm">
              RECEIVER
            </div>
          )}
          
          {isCompromised && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <ShieldAlertIcon className="w-8 h-8 text-red-500 opacity-70" />
            </div>
          )}
          
          {!isCompromised && (
            <div className="absolute -bottom-2 -right-2">
              <LockIcon className="w-4 h-4 text-gray-400" />
            </div>
          )}
        </div>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-gray-700 border-2 border-gray-500"
      />
    </div>
  );
};

export default memo(NetworkNode);
