'use client';
import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface FloatingGeometryProps {
  position?: [number, number, number];
  geometry?: 'icosahedron' | 'octahedron' | 'torus';
  color?: string;
  emissiveIntensity?: number;
  rotationSpeed?: number;
  scale?: number;
}

export default function FloatingGeometry({
  position = [0, 0, 0],
  geometry = 'icosahedron',
  color = '#3B82F6',
  emissiveIntensity = 0.4,
  rotationSpeed = 0.003,
  scale = 1,
}: FloatingGeometryProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    // Slow base rotation
    meshRef.current.rotation.y += rotationSpeed;
    meshRef.current.rotation.x += rotationSpeed * 0.4;

    // Mouse parallax
    meshRef.current.rotation.y +=
      (pointer.x * 0.2 - meshRef.current.rotation.y) * 0.01;
    meshRef.current.rotation.x +=
      (-pointer.y * 0.15 - meshRef.current.rotation.x) * 0.01;

    // Subtle floating
    meshRef.current.position.y =
      position[1] + Math.sin(t * 0.5) * 0.15;
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      {geometry === 'icosahedron' && <icosahedronGeometry args={[1.8, 1]} />}
      {geometry === 'octahedron' && <octahedronGeometry args={[1, 0]} />}
      {geometry === 'torus' && <torusGeometry args={[1.2, 0.3, 16, 48]} />}
      <meshStandardMaterial
        color={color}
        wireframe
        emissive={color}
        emissiveIntensity={emissiveIntensity}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}
