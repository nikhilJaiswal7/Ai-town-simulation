import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, ContactShadows, Stars, Plane } from '@react-three/drei';
import { Bloom, EffectComposer, Vignette, Noise } from '@react-three/postprocessing';
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

  const { lastJsonMessage, readyState } = useWS('ws://localhost:8000/ws', {
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
        }, 8000);
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
      <Canvas shadows camera={{ position: [15, 12, 15], fov: 40 }}>
        <Suspense fallback={null}>
          <Sky sunPosition={[100, 10, 100]} turbidity={0.1} rayleigh={0.5} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          <ambientLight intensity={0.6} />
          <pointLight position={[20, 20, 20]} castShadow intensity={1.5} />
          <spotLight position={[0, 20, 0]} angle={0.4} penumbra={1} castShadow intensity={2} />

          {/* Floor */}
          <gridHelper args={[80, 40, 0x222222, 0x111111]} position={[0, -0.01, 0]} />
          <Plane args={[200, 200]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
            <meshStandardMaterial color="#080a0f" roughness={1} />
          </Plane>

          {/* Village Elements */}
          <VillageEnvironment />
          <Trees />

          {/* Buildings */}
          {buildings.map(building => (
            <Building3D key={building.id} data={building} />
          ))}

          {/* NPCs */}
          {npcs.map(npc => (
            <NPC3D 
              key={npc.id} 
              data={npc} 
              chatMessage={chatBubbles[npc.id] || null}
              onClick={() => setActiveNPC(npc)}
            />
          ))}

          <ContactShadows position={[0, 0, 0]} opacity={0.6} scale={60} blur={2.5} far={10} />
          <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.2} />
          
          {/* Post Processing for Cinematic Look */}
          <EffectComposer disableNormalPass>
            <Bloom luminanceThreshold={1} luminanceSmoothing={0.9} height={300} />
            <Noise opacity={0.02} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </Suspense>
      </Canvas>

      {/* Manual Chat UI */}
      {activeNPC && (
        <ChatModal 
          npc={activeNPC} 
          onClose={() => setActiveNPC(null)} 
        />
      )}

      {/* Cinematic HUD */}
      <div className="absolute top-6 left-6 p-5 bg-black/40 backdrop-blur-xl rounded-xl border border-white/5 pointer-events-none z-50">
        <div className="flex items-center gap-3 mb-2">
            <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${readyState === ReadyState.OPEN ? 'bg-emerald-500 shadow-[0_0_12px_#10b981]' : 'bg-rose-500'}`} />
            <h2 className="text-sm font-extralight text-white uppercase tracking-[0.3em]">Village Simulation</h2>
        </div>
        <div className="h-[1px] w-full bg-white/10 mb-2" />
        <p className="text-[9px] text-slate-400 uppercase tracking-widest leading-relaxed">
          Autonomous Agents performing daily routines<br/>
          {npcs.length} Citizens Active • Time: Twilight
        </p>
      </div>
      
      {/* Bottom Ticker */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full pointer-events-none">
        <p className="text-[10px] text-slate-300 uppercase tracking-[0.2em]">Right-click to orbit • Click character to whisper</p>
      </div>
    </div>
  );
};

export default Town3D;
