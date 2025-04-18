
import React, { useEffect, useState } from 'react';
import { PackageIcon } from 'lucide-react';

interface PacketAnimationProps {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  isActive: boolean;
}

const PacketAnimation = ({ sourceX, sourceY, targetX, targetY, isActive }: PacketAnimationProps) => {
  const [style, setStyle] = useState({});
  
  useEffect(() => {
    if (isActive) {
      // Create keyframe animation dynamically based on start and end points
      const styleSheet = document.styleSheets[0];
      const animationName = `movePacket${Date.now()}`;
      
      const keyframes = `
        @keyframes ${animationName} {
          0% {
            left: ${sourceX}px;
            top: ${sourceY}px;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            left: ${(sourceX + targetX) / 2}px;
            top: ${(sourceY + targetY) / 2}px;
            transform: translate(-50%, -50%) scale(1.5);
          }
          100% {
            left: ${targetX}px;
            top: ${targetY}px;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `;
      
      try {
        styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
      } catch (e) {
        console.error("Failed to insert animation rule:", e);
      }
      
      setStyle({
        position: 'absolute' as const,
        left: sourceX,
        top: sourceY,
        transform: `translate(-50%, -50%)`,
        animation: `${animationName} 1s linear forwards`,
        zIndex: 1000
      });
      
      return () => {
        // Clean up by finding and removing the specific animation rule
        try {
          for (let i = 0; i < styleSheet.cssRules.length; i++) {
            if (styleSheet.cssRules[i].type === CSSRule.KEYFRAMES_RULE && 
                (styleSheet.cssRules[i] as CSSKeyframesRule).name === animationName) {
              styleSheet.deleteRule(i);
              break;
            }
          }
        } catch (e) {
          console.error("Failed to remove animation rule:", e);
        }
      };
    }
  }, [isActive, sourceX, sourceY, targetX, targetY]);

  if (!isActive) return null;

  return (
    <div style={style} className="pointer-events-none z-50">
      <div className="bg-primary/20 p-1 rounded-full animate-pulse">
        <PackageIcon className="w-8 h-8 text-primary animate-bounce neon-primary" />
      </div>
    </div>
  );
};

export default PacketAnimation;
