'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface AmbientParticlesProps {
  count?: number;
  spread?: number;
  speed?: number;
  color?: string;
  size?: number;
}

export default function AmbientParticles({
  count = 200,
  spread = 16,
  speed = 0.15,
  color = '#93C5FD',
  size = 0.018,
}: AmbientParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 2] = (Math.random() - 0.5) * (spread * 0.6);
    }
    return pos;
  }, [count, spread]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const t = state.clock.elapsedTime * speed;
    pointsRef.current.rotation.y = t * 0.05;
    pointsRef.current.rotation.x = Math.sin(t * 0.3) * 0.02;
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3}>
      <PointMaterial
        color={color}
        size={size}
        sizeAttenuation
        transparent
        opacity={0.5}
        depthWrite={false}
      />
    </Points>
  );
}
