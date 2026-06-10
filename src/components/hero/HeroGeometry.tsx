'use client';

import { useRef, type PointerEvent } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';
import { GeometryShape } from './GeometryShape';
import type { GeometryType } from './geometry-shapes';
import { auditiq } from '@/lib/theme/colors';

/**
 * HeroGeometry — reusable interactive geometry layer (Phase 6.1).
 *
 * Lays out 5 wireframe polyhedra (sizes 60/100/140/180) around the savings
 * card and drives a shared, spring-smoothed pointer-proximity parallax. On
 * pointer leave the spring returns to 0, so every shape eases back to rest.
 *
 * Replaces the old R3F `HeroScene` wireframe sphere — no Three.js here, so it
 * is light, responsive, and reduced-motion friendly.
 */

interface ShapeConfig {
  type: GeometryType;
  size: number;
  color: string;
  position: Partial<Record<'top' | 'left' | 'right' | 'bottom', string>>;
  depth: number;
  floatDuration: number;
  floatDelay: number;
  /** Hidden below `sm` to keep mobile uncluttered (content-first). */
  hideOnMobile?: boolean;
}

const SHAPES: ShapeConfig[] = [
  {
    type: 'icosahedron',
    size: 180,
    color: auditiq.sapGreen,
    position: { top: '-4%', right: '6%' },
    depth: 26,
    floatDuration: 9,
    floatDelay: 0,
  },
  {
    type: 'octahedron',
    size: 140,
    color: auditiq.bottleGreen,
    position: { top: '34%', left: '-7%' },
    depth: 20,
    floatDuration: 7.5,
    floatDelay: 0.6,
  },
  {
    type: 'prism',
    size: 100,
    color: auditiq.sage,
    position: { bottom: '2%', right: '16%' },
    depth: 16,
    floatDuration: 8.5,
    floatDelay: 1.1,
  },
  {
    type: 'cube',
    size: 100,
    color: auditiq.chocolate,
    position: { top: '4%', left: '8%' },
    depth: 22,
    floatDuration: 7,
    floatDelay: 0.3,
    hideOnMobile: true,
  },
  {
    type: 'tetrahedron',
    size: 60,
    color: auditiq.sapGreen,
    position: { bottom: '16%', left: '4%' },
    depth: 14,
    floatDuration: 6.5,
    floatDelay: 1.4,
    hideOnMobile: true,
  },
];

export function HeroGeometry({ reduce = false }: { reduce?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const pointerX = useSpring(rawX, { stiffness: 80, damping: 18, mass: 0.6 });
  const pointerY = useSpring(rawY, { stiffness: 80, damping: 18, mass: 0.6 });

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    rawX.set(Math.max(-1, Math.min(1, nx)));
    rawY.set(Math.max(-1, Math.min(1, ny)));
  };

  const handlePointerLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return (
    <div
      ref={ref}
      aria-hidden="true"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="absolute inset-0"
    >
      {SHAPES.map((s, i) => (
        <GeometryShape
          key={i}
          type={s.type}
          size={s.size}
          color={s.color}
          position={s.position}
          depth={s.depth}
          floatDuration={s.floatDuration}
          floatDelay={s.floatDelay}
          pointerX={pointerX}
          pointerY={pointerY}
          reduce={reduce}
          className={s.hideOnMobile ? 'hidden sm:block' : ''}
        />
      ))}
    </div>
  );
}
