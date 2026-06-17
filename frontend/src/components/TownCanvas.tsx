import { useState, useEffect } from 'react';
import Building from './Building';
import NPC from './NPC';
import ChatModal from './ChatModal';

export interface Position {
  x: number;
  y: number;
}

export interface BuildingData {
  id: string;
  type: 'house' | 'shop' | 'library';
  pos: Position;
  size: { w: number; h: number };
}

export interface NPCData {
  id: string;
  name: string;
  pos: Position;
}

const TownCanvas: React.FC = () => {
  const [buildings] = useState<BuildingData[]>([
    { id: 'b1', type: 'house', pos: { x: 100, y: 150 }, size: { w: 100, h: 100 } },
    { id: 'b2', type: 'shop', pos: { x: 400, y: 100 }, size: { w: 120, h: 80 } },
    { id: 'b3', type: 'library', pos: { x: 250, y: 350 }, size: { w: 150, h: 120 } },
  ]);

  const [npcs, setNpcs] = useState<NPCData[]>([]);
  const [activeNPC, setActiveNPC] = useState<NPCData | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/state')
      .then(res => res.json())
      .then(data => {
        const loadedNpcs = data.characters.map((c: any) => ({
          id: c.id,
          name: c.name,
          pos: { x: c.x, y: c.y }
        }));
        setNpcs(loadedNpcs);
      });
  }, []);

  const handleNPCMove = (id: string, newPos: Position) => {
    setNpcs(prev => prev.map(npc => npc.id === id ? { ...npc, pos: newPos } : npc));
    
    // Sync with backend
    fetch('http://localhost:8000/api/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ character_id: id, x: newPos.x, y: newPos.y })
    });
  };

  return (
    <div className="relative w-full h-full bg-town-deep overflow-hidden cursor-crosshair">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-br from-town-twilight/20 to-transparent pointer-events-none" />
      
      {/* Buildings */}
      {buildings.map(building => (
        <Building key={building.id} data={building} />
      ))}

      {/* NPCs */}
      {npcs.map(npc => (
        <NPC 
          key={npc.id} 
          data={npc} 
          onMove={(pos) => handleNPCMove(npc.id, pos)} 
          onClick={() => setActiveNPC(npc)}
          buildings={buildings} 
        />
      ))}

      {/* Chat Modal */}
      {activeNPC && (
        <ChatModal 
          npc={activeNPC} 
          onClose={() => setActiveNPC(null)} 
        />
      )}

      {/* UI Overlay */}
      <div className="absolute bottom-4 left-4 p-4 bg-black/40 backdrop-blur-md rounded-lg border border-white/10">
        <h2 className="text-sm font-light text-town-warm uppercase tracking-widest">Town Square</h2>
        <p className="text-xs text-slate-400">Drag characters to explore, click to talk.</p>
      </div>
    </div>
  );
};

export default TownCanvas;
