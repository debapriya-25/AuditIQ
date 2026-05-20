'use client';
import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

/**
 * HeroScene — The landing page 3D scene.
 * Features a wireframe icosahedron with mouse parallax,
 * a secondary octahedron, and a sparse particle field.
 */
export default function HeroScene() {
  const primaryRef = useRef<THREE.Mesh>(null);
  const secondaryRef = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    if (primaryRef.current) {
      primaryRef.current.rotation.y += 0.003;
      primaryRef.current.rotation.x += 0.001;
      primaryRef.current.rotation.y +=
        (pointer.x * 0.3 - primaryRef.current.rotation.y) * 0.015;
      primaryRef.current.rotation.x +=
        (-pointer.y * 0.2 - primaryRef.current.rotation.x) * 0.015;
      primaryRef.current.position.y = 0.5 + Math.sin(t * 0.4) * 0.12;
    }

    if (secondaryRef.current) {
      secondaryRef.current.rotation.y -= 0.004;
      secondaryRef.current.rotation.z += 0.002;
      secondaryRef.current.position.y = -1 + Math.sin(t * 0.6 + 1) * 0.1;
    }
  });

  const particles = useMemo(() => {
    const count = 180;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.15} />
      <pointLight position={[4, 3, 3]} intensity={1.2} color="#3B82F6" />
      <pointLight position={[-3, -2, 2]} intensity={0.7} color="#8B5CF6" />
      <pointLight position={[0, 2, -3]} intensity={0.4} color="#22D3EE" />

      {/* Primary — Wireframe Icosahedron */}
      <mesh ref={primaryRef} position={[2.2, 0.5, -1]}>
        <icosahedronGeometry args={[1.8, 1]} />
        <meshStandardMaterial
          color="#3B82F6"
          wireframe
          emissive="#3B82F6"
          emissiveIntensity={0.35}
          transparent
          opacity={0.65}
        />
      </mesh>

      {/* Secondary — Octahedron */}
      <mesh ref={secondaryRef} position={[-2.5, -1, -2]}>
        <octahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial
          color="#8B5CF6"
          wireframe
          emissive="#8B5CF6"
          emissiveIntensity={0.3}
          transparent
          opacity={0.45}
        />
      </mesh>

      {/* Particle Field */}
      <Points positions={particles} stride={3}>
        <PointMaterial
          color="#BAE6FD"
          size={0.022}
          sizeAttenuation
          transparent
          opacity={0.5}
          depthWrite={false}
        />
      </Points>
    </>
  );
}
