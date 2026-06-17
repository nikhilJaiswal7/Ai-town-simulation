import { useMemo } from 'react';

const Tree = ({ position }: { position: [number, number, number] }) => {
  const height = useMemo(() => 0.5 + Math.random() * 0.5, []);
  
  return (
    <group position={position}>
      {/* Trunk */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.08, height, 8]} />
        <meshStandardMaterial color="#451a03" />
      </mesh>
      
      {/* Leaves */}
      <mesh position={[0, height + 0.2, 0]} castShadow>
        <icosahedronGeometry args={[0.3, 1]} />
        <meshStandardMaterial color="#065f46" flatShading />
      </mesh>
    </group>
  );
};

const Trees = () => {
  const trees = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      position: [
        (Math.random() - 0.5) * 30,
        0,
        (Math.random() - 0.5) * 30
      ] as [number, number, number]
    }));
  }, []);

  return (
    <>
      {trees.map(tree => (
        <Tree key={tree.id} position={tree.position} />
      ))}
    </>
  );
};

export default Trees;
