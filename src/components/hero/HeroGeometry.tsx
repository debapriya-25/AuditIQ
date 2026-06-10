'use client';

import { useRef, type PointerEvent } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';
import { GeometryShape } from './GeometryShape';
import type { GeometryType } from './geometry-shapes';
import { palette } from '@/lib/theme/colors';

/**
 * HeroGeometry — reusable interactive geometry layer (Phase 6.2).
 *
 * Lays out 8 small wireframe polyhedra (sizes 60–180, tetrahedrons /
 * octahedrons / diamonds / prisms / cubes — no spheres or globes) around the
 * savings card. Shapes are static by default; a shared spring-smoothed
 * pointer-proximity parallax adds subtle reactive depth and eases back to rest
 * on pointer leave. Lighter shapes are hidden on mobile to keep it uncluttered.
 *
 * Replaces the old R3F `HeroScene` sphere — SVG + Framer Motion only.
 */

interface ShapeConfig {
  type: GeometryType;
  size: number;
  color: string;
  position: Partial<Record<'top' | 'left' | 'right' | 'bottom', string>>;
  depth: number;
  restRotate: number;
  /** Hidden below `sm` to keep mobile content-first and uncluttered. */
  hideOnMobile?: boolean;
}

const SHAPES: ShapeConfig[] = [
  // Primary trio (always visible)
  {
    type: 'icosahedron',
    size: 170,
    color: palette.sap,
    position: { top: '-6%', right: '4%' },
    depth: 24,
    restRotate: -6,
  },
  {
    type: 'octahedron', // wireframe diamond
    size: 150,
    color: palette.bottle,
    position: { top: '32%', left: '-8%' },
    depth: 20,
    restRotate: 8,
  },
  {
    type: 'prism',
    size: 130,
    color: palette.sage,
    position: { bottom: '0%', right: '14%' },
    depth: 16,
    restRotate: -10,
  },
  // Secondary set (mobile-hidden)
  {
    type: 'cube',
    size: 110,
    color: palette.sap,
    position: { top: '2%', left: '6%' },
    depth: 22,
    restRotate: 6,
    hideOnMobile: true,
  },
  {
    type: 'tetrahedron',
    size: 90,
    color: palette.sage,
    position: { bottom: '14%', left: '2%' },
    depth: 14,
    restRotate: -8,
    hideOnMobile: true,
  },
  {
    type: 'octahedron',
    size: 80,
    color: palette.sap,
    position: { top: '54%', right: '2%' },
    depth: 14,
    restRotate: 12,
    hideOnMobile: true,
  },
  {
    type: 'tetrahedron',
    size: 70,
    color: palette.mint,
    position: { top: '8%', left: '42%' },
    depth: 12,
    restRotate: 10,
    hideOnMobile: true,
  },
  {
    type: 'cube',
    size: 60,
    color: palette.pistachio,
    position: { bottom: '32%', right: '40%' },
    depth: 10,
    restRotate: -12,
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
          restRotate={s.restRotate}
          pointerX={pointerX}
          pointerY={pointerY}
          reduce={reduce}
          className={s.hideOnMobile ? 'hidden sm:block' : ''}
        />
      ))}
    </div>
  );
}
