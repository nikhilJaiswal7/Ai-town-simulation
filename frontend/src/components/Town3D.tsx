import { useState, useEffect, Suspense, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, ContactShadows, Stars, Plane } from '@react-three/drei';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import Building3D from './Building3D';
import NPC3D from './NPC3D';
import Trees from './Trees3D';
import VillageEnvironment from './VillageEnvironment';
import ChatModal from './ChatModal';
import type { NPCData, BuildingData, Position } from './TownCanvas';

// Workaround for CJS/ESM interop
const useWS = (useWebSocket as any).default || useWebSocket;

const Town3D = () => {
  const [buildings] = useState<BuildingData[]>([
    { id: 'b1', type: 'house', pos: { x: 150, y: 150 }, size: { w: 100, h: 100 } },
    { id: 'b2', type: 'shop', pos: { x: 450, y: 100 }, size: { w: 120, h: 80 } },
    { id: 'b3', type: 'library', pos: { x: 250, y: 350 }, size: { w: 150, h: 120 } },
    { id: 'b4', type: 'house', pos: { x: -200, y: -150 }, size: { w: 100, h: 100 } },
    { id: 'b5', type: 'house', pos: { x: -350, y: 200 }, size: { w: 100, h: 100 } },
    { id: 'b6', type: 'shop', pos: { x: 100, y: -250 }, size: { w: 110, h: 90 } },
  ]);

  const [npcs, setNpcs] = useState<(NPCData & { target_x?: number; target_y?: number })[]>([]);
  const [activeNPC, setActiveNPC] = useState<NPCData | null>(null);
  const [chatBubbles, setChatBubbles] = useState<Record<string, string>>({});

  const { sendJsonMessage, lastJsonMessage, readyState } = useWS('ws://localhost:8000/ws', {
    shouldReconnect: () => true,
  });

  useEffect(() => {
    if (lastJsonMessage) {
      const data = lastJsonMessage as any;
      if (data.type === 'sync') {
        setNpcs(data.characters.map((c: any) => ({
          id: c.id,
          name: c.name,
          pos: { x: c.x, y: c.y },
          target_x: c.target_x,
          target_y: c.target_y,
          state: c.state
        })));
      } else if (data.type === 'chat_event') {
        setChatBubbles(prev => ({ ...prev, [data.character_id]: data.message }));
        setTimeout(() => {
          setChatBubbles(prev => {
            const next = { ...prev };
            delete next[data.character_id];
            return next;
          });
        }, 5000);
      }
    }
  }, [lastJsonMessage]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Live',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Offline',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return (
    <div className="w-full h-full bg-[#050505] fixed inset-0 overflow-hidden">
      <Canvas shadows camera={{ position: [10, 10, 10], fov: 45 }}>
        <Suspense fallback={null}>
          <Sky sunPosition={[100, 20, 100]} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          <ambientLight intensity={0.8} />
          <pointLight position={[10, 10, 10]} castShadow intensity={1} />
          <spotLight position={[0, 15, 0]} angle={0.5} penumbra={1} castShadow intensity={2} />

          {/* Floor */}
          <gridHelper args={[60, 60, 0x333333, 0x222222]} position={[0, -0.01, 0]} />
          <Plane args={[150, 150]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
            <meshStandardMaterial color="#0a0c12" roughness={1} />
          </Plane>

          {/* Buildings */}
          {buildings.map(building => (
            <Building3D key={building.id} data={building} />
          ))}

          {/* Environment */}
          <VillageEnvironment />
          <Trees />

          {/* NPCs */}
          {npcs.map(npc => (
            <NPC3D 
              key={npc.id} 
              data={npc} 
              chatMessage={chatBubbles[npc.id] || null}
              onClick={() => setActiveNPC(npc)}
            />
          ))}

          <ContactShadows position={[0, 0, 0]} opacity={0.6} scale={60} blur={2} far={4.5} />
          <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} />
        </Suspense>
      </Canvas>

      {/* Manual Chat UI */}
      {activeNPC && (
        <ChatModal 
          npc={activeNPC} 
          onClose={() => setActiveNPC(null)} 
        />
      )}

      {/* Simulation Info */}
      <div className="absolute top-4 left-4 p-4 bg-black/60 backdrop-blur-md rounded-lg border border-white/10 pointer-events-none z-50">
        <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${readyState === ReadyState.OPEN ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`} />
            <h2 className="text-sm font-light text-white uppercase tracking-widest">3D AI VILLAGE: {connectionStatus}</h2>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 uppercase">Right-click to rotate • Characters performing village chores</p>
      </div>
    </div>
  );
};

export default Town3D;
