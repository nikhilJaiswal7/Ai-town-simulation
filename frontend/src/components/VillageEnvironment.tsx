import { useMemo } from 'react';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

const Hill = ({ position, scale }: { position: [number, number, number], scale: [number, number, number] }) => (
  <mesh position={position} scale={scale} castShadow receiveShadow>
    <sphereGeometry args={[1, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
    <meshStandardMaterial color="#14532d" roughness={1} />
  </mesh>
);

const River = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0]} receiveShadow>
    <planeGeometry args={[10, 40]} />
    <meshStandardMaterial color="#1d4ed8" transparent opacity={0.6} metalness={0.8} roughness={0.2} />
  </mesh>
);

const VillageEnvironment = () => {
  const hills = useMemo(() => [
    { pos: [8, 0, 5], scale: [5, 3, 5] },
    { pos: [-8, 0, -10], scale: [6, 4, 6] },
    { pos: [12, 0, -15], scale: [8, 5, 8] },
    { pos: [-15, 0, 10], scale: [7, 4, 7] },
  ], []);

  return (
    <group>
      {/* Hills */}
      {hills.map((h, i) => (
        <Hill key={i} position={h.pos as any} scale={h.scale as any} />
      ))}
      
      {/* River */}
      <River />
      
      {/* Decorative Rocks */}
      <mesh position={[2, 0, 5]} castShadow>
        <dodecahedronGeometry args={[0.3, 0]} />
        <meshStandardMaterial color="#4b5563" />
      </mesh>
      <mesh position={[1.8, 0, -8]} castShadow>
        <dodecahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
    </group>
  );
};

export default VillageEnvironment;
