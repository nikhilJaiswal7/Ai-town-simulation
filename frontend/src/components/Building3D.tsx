import ChimneySmoke from './ChimneySmoke';
import type { BuildingData } from './TownCanvas';

interface Building3DProps {
  data: BuildingData;
}

const Building3D = ({ data }: Building3DProps) => {
  const getColor = () => {
    switch (data.type) {
      case 'house': return '#475569';
      case 'shop': return '#4338ca';
      case 'library': return '#065f46';
      default: return '#334155';
    }
  };

  const width = data.size.w / 100;
  const height = data.size.h / 100;
  const depth = width;

  return (
    <group position={[data.pos.x / 100, height / 2, data.pos.y / 100]}>
      {/* Main Body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={getColor()} roughness={0.7} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, height / 2 + (height / 4), 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[width * 0.9, height * 0.8, 4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>

      {/* Chimney */}
      <mesh position={[width * 0.25, height * 0.6, 0]} castShadow>
        <boxGeometry args={[0.15, 0.4, 0.15]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      
      {/* Smoke Effect */}
      <ChimneySmoke position={[width * 0.25, height * 0.8, 0]} />

      {/* Windows (Glowing) */}
      <mesh position={[0, 0, depth / 2 + 0.01]}>
        <boxGeometry args={[width * 0.3, height * 0.4, 0.02]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.8} />
      </mesh>

      {/* Ground Shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -height / 2 + 0.01, 0]} receiveShadow>
        <planeGeometry args={[width * 1.5, depth * 1.5]} />
        <meshStandardMaterial color="black" transparent opacity={0.2} />
      </mesh>
    </group>
  );
};

export default Building3D;
