'use client';

import { type MotionValue } from 'framer-motion';
import { GeometryShape } from './GeometryShape';
import type { GeometryType } from './geometry-shapes';
import { palette } from '@/lib/theme/colors';

/**
 * HeroGeometry — intentionally-composed interactive geometry layer.
 *
 * Reads left → right as a deliberate flow: a true-3D geodesic SPHERE bridges the
 * headline into the field, an octahedron anchors the mid, a true-3D DODECAHEDRON
 * leads into the reduced upper-right icosahedron cluster, with smaller accents
 * filling the gaps. No duplicated geometry, no right-side overcrowding.
 *
 * Shapes are static by default; a shared spring-smoothed pointer-proximity
 * parallax adds subtle reactive depth that eases back to rest on pointer leave.
 * Hover triggers a gentle spring rotate + scale. No perpetual / auto motion.
 * SVG + Framer Motion only (no R3F).
 */

interface ShapeConfig {
  type: GeometryType;
  size: number;
  color: string;
  position: Partial<Record<'top' | 'left' | 'right' | 'bottom', string>>;
  depth: number;
  restRotate: number;
  /** Stroke/vertex opacity override (0..1). Omitted = original look. */
  opacity?: number;
  /** Hidden below `sm` to keep mobile content-first and uncluttered. */
  hideOnMobile?: boolean;
}

const SHAPES: ShapeConfig[] = [
  // ── Bridge: geodesic sphere (true 3D). The composition's focal point — it
  //    bridges the headline (left) into the right-hand cluster and fills the
  //    centre the Sample Report card used to occupy. ──
  {
    type: 'geosphere',
    size: 190,
    color: palette.sap,
    opacity: 0.68,
    position: { top: '12%', left: '6%' },
    depth: 26,
    restRotate: 0,
  },
  // ── Mid spine: octahedron (sits below the sphere) ──
  {
    type: 'octahedron',
    size: 150,
    color: palette.bottle,
    position: { top: '48%', left: '12%' },
    depth: 20,
    restRotate: 8,
  },
  // ── Centre-right: dodecahedron, rebuilt as a true-3D wireframe ──
  {
    type: 'dodecahedron',
    size: 166,
    color: palette.bottle,
    opacity: 0.58,
    position: { top: '16%', right: '22%' },
    depth: 22,
    restRotate: -7,
  },
  // ── Upper-right cluster: icosahedron, reduced ~16% and raised so it no
  //    longer dominates the hierarchy ──
  {
    type: 'icosahedron',
    size: 142,
    color: palette.sap,
    position: { top: '-12%', right: '5%' },
    depth: 22,
    restRotate: -6,
  },
  {
    type: 'prism',
    size: 130,
    color: palette.sage,
    position: { bottom: '0%', right: '16%' },
    depth: 16,
    restRotate: -10,
  },
  // ── Supporting accents (mobile-hidden) — fill the gaps, balance the field ──
  {
    type: 'cube',
    size: 110,
    color: palette.sap,
    position: { top: '-8%', left: '6%' },
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
    position: { top: '56%', right: '6%' },
    depth: 14,
    restRotate: 12,
    hideOnMobile: true,
  },
  {
    type: 'tetrahedron',
    size: 70,
    color: palette.mint,
    position: { bottom: '26%', right: '36%' },
    depth: 12,
    restRotate: 10,
    hideOnMobile: true,
  },
  {
    type: 'cube',
    size: 60,
    color: palette.pistachio,
    position: { top: '6%', right: '40%' },
    depth: 10,
    restRotate: -12,
    hideOnMobile: true,
  },
];

interface HeroGeometryProps {
  /** Shared, spring-smoothed pointer offsets (-1..1) from the hero section. */
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  reduce?: boolean;
}

export function HeroGeometry({
  pointerX,
  pointerY,
  reduce = false,
}: HeroGeometryProps) {
  return (
    <div aria-hidden="true" className="absolute inset-0">
      {SHAPES.map((s, i) => (
        <GeometryShape
          key={i}
          type={s.type}
          size={s.size}
          color={s.color}
          position={s.position}
          depth={s.depth}
          restRotate={s.restRotate}
          opacity={s.opacity}
          pointerX={pointerX}
          pointerY={pointerY}
          reduce={reduce}
          className={s.hideOnMobile ? 'hidden sm:block' : ''}
        />
      ))}
    </div>
  );
}
