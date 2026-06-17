import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import type { NPCData, Position } from './TownCanvas';

interface NPC3DProps {
  data: NPCData & { target_x?: number; target_y?: number };
  onClick: () => void;
  chatMessage: string | null;
}

const NPC3D = ({ data, onClick, chatMessage }: NPC3DProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const targetPos = useRef(new THREE.Vector3(data.pos.x / 100, 0, data.pos.y / 100));

  useEffect(() => {
    targetPos.current.set(data.pos.x / 100, 0, data.pos.y / 100);
  }, [data.pos.x, data.pos.y]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      // Smoothly interpolate position towards the target
      groupRef.current.position.lerp(targetPos.current, delta * 2);
      
      // Look at target direction if moving
      const distance = groupRef.current.position.distanceTo(targetPos.current);
      if (distance > 0.1) {
        const dir = new THREE.Vector3().subVectors(targetPos.current, groupRef.current.position).normalize();
        const targetRotation = Math.atan2(dir.x, dir.z);
        const currentRotation = groupRef.current.rotation.y;
        groupRef.current.rotation.y += (targetRotation - currentRotation) * delta * 5;
      }
    }
  });

  return (
    <group 
      ref={groupRef} 
      position={[data.pos.x / 100, 0, data.pos.y / 100]}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        {/* Procedural Animated Character Body */}
        <mesh castShadow position={[0, 0.4, 0]}>
          <capsuleGeometry args={[0.2, 0.4, 4, 8]} />
          <meshStandardMaterial color={data.id === 'n1' ? '#fbbf24' : '#60a5fa'} roughness={0.3} />
        </mesh>
        
        {/* Head */}
        <mesh position={[0, 0.75, 0]} castShadow>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#fef3c7" />
        </mesh>
      </Float>

      {/* Name Label */}
      <Text
        position={[0, 1.2, 0]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {data.name}
      </Text>

      {/* Chat Bubble */}
      {chatMessage && (
        <group position={[0, 1.6, 0]}>
          <mesh>
            <planeGeometry args={[1.5, 0.4]} />
            <meshBasicMaterial color="white" transparent opacity={0.9} />
          </mesh>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.08}
            color="black"
            maxWidth={1.4}
            textAlign="center"
          >
            {chatMessage}
          </Text>
        </group>
      )}

      {/* Shadow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
        <planeGeometry args={[0.6, 0.6]} />
        <meshStandardMaterial color="black" transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

export default NPC3D;
