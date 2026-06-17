import { useState } from 'react';
import { motion } from 'framer-motion';
import type { BuildingData, NPCData, Position } from './TownCanvas';

interface NPCProps {
  data: NPCData;
  onMove: (pos: Position) => void;
  onClick: () => void;
  buildings: BuildingData[];
}

const NPC = ({ data, onMove, onClick, buildings }: NPCProps) => {
  const [isNearBuilding, setIsNearBuilding] = useState<string | null>(null);

  const checkProximity = (x: number, y: number) => {
    let near: string | null = null;
    buildings.forEach(b => {
      const distance = Math.sqrt(
        Math.pow((x + 16) - (b.pos.x + b.size.w / 2), 2) +
        Math.pow((y + 16) - (b.pos.y + b.size.h / 2), 2)
      );
      if (distance < 80) {
        near = b.type;
      }
    });
    setIsNearBuilding(near);
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ x: data.pos.x, y: data.pos.y }}
      animate={{ x: data.pos.x, y: data.pos.y }}
      onDrag={(_, info) => {
        checkProximity(data.pos.x + info.offset.x, data.pos.y + info.offset.y);
      }}
      onDragEnd={(_, info) => {
        onMove({ x: data.pos.x + info.offset.x, y: data.pos.y + info.offset.y });
      }}
      onClick={(e) => {
        // Prevent click if we were dragging
        if (Math.abs(e.movementX) < 5 && Math.abs(e.movementY) < 5) {
          onClick();
        }
      }}
      className="absolute z-10 group cursor-pointer"
      style={{ left: 0, top: 0 }}
    >
      {/* Shadow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-2 bg-black/40 blur-md rounded-full" />
      
      {/* NPC Body */}
      <div className="relative w-8 h-8 rounded-full bg-slate-400 border border-white/20 overflow-hidden shadow-lg group-active:scale-110 transition-transform">
        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent" />
        {/* "Glow" when near building */}
        {isNearBuilding && (
          <div className="absolute inset-0 bg-town-warm/20 animate-pulse" />
        )}
      </div>

      {/* Label */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[10px] text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
        {data.name} {isNearBuilding ? `(at ${isNearBuilding})` : ''}
      </div>

      {/* Interaction Indicator */}
      {isNearBuilding && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -right-1 -top-1 w-3 h-3 bg-town-warm rounded-full border border-black shadow-[0_0_10px_#fbbf24]"
        />
      )}
    </motion.div>
  );
};

export default NPC;
