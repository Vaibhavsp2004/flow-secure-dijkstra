
import React from 'react';
import { PackageIcon } from 'lucide-react';

interface PacketAnimationProps {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  isActive: boolean;
}

const PacketAnimation = ({ sourceX, sourceY, targetX, targetY, isActive }: PacketAnimationProps) => {
  if (!isActive) return null;

  const animationStyle = {
    position: 'absolute' as const,
    left: sourceX,
    top: sourceY,
    transform: `translate(-50%, -50%)`,
    animation: 'movePacket 1s linear forwards',
  };

  return (
    <div style={animationStyle} className="pointer-events-none z-50">
      <PackageIcon className="w-6 h-6 text-primary animate-bounce" />
    </div>
  );
};

export default PacketAnimation;
