import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Hill = ({ position, scale }: { position: [number, number, number], scale: [number, number, number] }) => (
  <mesh position={position} scale={scale} castShadow receiveShadow>
    <sphereGeometry args={[1, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
    <meshStandardMaterial color="#166534" roughness={1} />
  </mesh>
);

const River = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // High-end animated water effect using simple UV offset
  useFrame((state) => {
    if (meshRef.current) {
      (meshRef.current.material as THREE.MeshStandardMaterial).normalMap?.offset.set(0, state.clock.elapsedTime * 0.05);
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0]} receiveShadow>
      <planeGeometry args={[12, 60]} />
      <meshStandardMaterial 
        color="#1d4ed8" 
        transparent 
        opacity={0.7} 
        metalness={0.9} 
        roughness={0.1}
        emissive="#1e3a8a"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
};

const VillageEnvironment = () => {
  const hills = useMemo(() => [
    { pos: [12, 0, 8], scale: [8, 5, 8] },
    { pos: [-12, 0, -15], scale: [10, 6, 10] },
    { pos: [18, 0, -20], scale: [12, 8, 12] },
    { pos: [-20, 0, 15], scale: [9, 5, 9] },
    { pos: [0, 0, -30], scale: [15, 10, 15] },
  ], []);

  return (
    <group>
      {/* Dynamic Hills */}
      {hills.map((h, i) => (
        <Hill key={i} position={h.pos as any} scale={h.scale as any} />
      ))}
      
      {/* Procedural River */}
      <River />
      
      {/* Decorative Ground Rocks */}
      <mesh position={[4, 0, 12]} castShadow>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#4b5563" roughness={0.9} />
      </mesh>
      <mesh position={[-4, 0, -18]} castShadow>
        <dodecahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color="#374151" roughness={0.9} />
      </mesh>

      {/* Atmospheric Fog Helper (Visual only) */}
      <mesh position={[0, 0, -40]}>
        <sphereGeometry args={[20, 32, 32]} />
        <meshBasicMaterial color="#0a0c12" transparent opacity={0.1} side={THREE.BackSide} />
      </mesh>
    </group>
  );
};

export default VillageEnvironment;
