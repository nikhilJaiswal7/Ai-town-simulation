import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ChimneySmoke = ({ position }: { position: [number, number, number] }) => {
  const meshRef = useRef<THREE.Points>(null);
  
  const particleCount = 20;
  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 0.1;
    positions[i * 3 + 1] = Math.random() * 2;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.1;
    sizes[i] = Math.random() * 0.1 + 0.05;
  }

  useFrame((state) => {
    if (meshRef.current) {
      const geometry = meshRef.current.geometry as THREE.BufferGeometry;
      const posAttr = geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        let y = posAttr.getY(i);
        y += 0.01;
        if (y > 1.5) y = 0;
        posAttr.setY(i, y);
        // Drift
        posAttr.setX(i, posAttr.getX(i) + Math.sin(state.clock.elapsedTime + i) * 0.001);
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={meshRef} position={position}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#ffffff" transparent opacity={0.3} size={0.15} sizeAttenuation />
    </points>
  );
};

export default ChimneySmoke;
