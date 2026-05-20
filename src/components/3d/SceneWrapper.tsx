'use client';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface SceneWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export default function SceneWrapper({ children, className }: SceneWrapperProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return null; // CSS gradient fallback handles background
  }

  return (
    <div className={`fixed inset-0 -z-10 ${className || ''}`} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 1.5]} // Cap at 1.5x DPR for performance
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
}
