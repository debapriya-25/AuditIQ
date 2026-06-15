'use client';

import { motion, type TargetAndTransition, type Transition } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { usePointerParallax } from '@/hooks/usePointerParallax';
import { GeometryShape } from '@/components/hero/GeometryShape';
import type { GeometryType } from '@/components/hero/geometry-shapes';
import { palette } from '@/lib/theme/colors';

/**
 * ResultsAtmosphere — ambient background for the /results surface (visual only).
 *
 * Same primitives as the audit/landing atmospheres (no new rendering system):
 *   1. Soft mesh blooms — sage / mint radial gradients, slow drift
 *   2. Floating wireframe polyhedra — slow ambient drift + shared pointer parallax
 *
 * There is intentionally NO flowing line/path animation here: the results page
 * does NOT reuse the landing hero's FloatingPathsBackground (it competed with the
 * data hierarchy). The lower-left space it occupied is filled with extra wireframe
 * shapes instead, using the same system.
 *
 * The results page is data-first, so the layers stay subtle and frame the central
 * column from the margins without competing with the cards. Palette is sage /
 * mint / pistachio only (no blue, no neon, no glow). aria-hidden +
 * pointer-events-none; fully static under reduced motion.
 */

// Mesh blooms — rgba mirrors palette sage / mint at <=10% alpha (alpha needs rgba).
interface Bloom {
  color: string;
  size: number;
  position: Partial<Record<'top' | 'left' | 'right' | 'bottom', string>>;
  drift: { x: number[]; y: number[]; scale: number[] };
  duration: number;
}

const BLOOMS: Bloom[] = [
  {
    color: 'rgba(168,195,160,0.10)', // sage
    size: 640,
    position: { top: '-10%', left: '-10%' },
    drift: { x: [0, 32, 0], y: [0, 24, 0], scale: [1, 1.07, 1] },
    duration: 30,
  },
  {
    color: 'rgba(191,227,192,0.09)', // mint
    size: 600,
    position: { bottom: '-12%', right: '-8%' },
    drift: { x: [0, -28, 0], y: [0, -22, 0], scale: [1, 1.08, 1] },
    duration: 36,
  },
];

interface AtmosphereShape {
  type: GeometryType;
  size: number;
  color: string;
  opacity: number;
  position: Partial<Record<'top' | 'left' | 'right' | 'bottom', string>>;
  depth: number;
  restRotate: number;
  ambientDelay: number;
}

// Heavier stroke than the default (1.5) so the wireframes read more strongly
// without inflating fill — prioritises stroke presence per the design intent.
const RESULTS_STROKE = 1.85;

// Wireframes composed across the whole canvas — left/right gutters plus the top
// and bottom padding bands — never behind the central cards. Opacity is lifted
// again (~30% over the prior pass) and paired with the heavier stroke so the
// field reads closer to the landing page while staying premium, not distracting.
const SHAPES: AtmosphereShape[] = [
  // ── Top band ──
  { type: 'octahedron',   size: 110, color: palette.sage,      opacity: 0.19, position: { top: '6%',     left: '3%'  }, depth: 22, restRotate: 8,   ambientDelay: 0   },
  { type: 'dodecahedron', size: 118, color: palette.sage,      opacity: 0.17, position: { top: '5%',     right: '3%' }, depth: 22, restRotate: -7,  ambientDelay: 1.2 },
  { type: 'octahedron',   size: 92,  color: palette.sage,      opacity: 0.18, position: { top: '17%',    right: '4%' }, depth: 20, restRotate: -6,  ambientDelay: 1.8 },
  // ── Mid band (gutters only) ──
  { type: 'icosahedron',  size: 84,  color: palette.mint,      opacity: 0.16, position: { top: '38%',    left: '-1%' }, depth: 16, restRotate: -6,  ambientDelay: 3   },
  { type: 'prism',        size: 80,  color: palette.mint,      opacity: 0.16, position: { top: '46%',    right: '0%' }, depth: 15, restRotate: -10, ambientDelay: 2.2 },
  { type: 'dodecahedron', size: 90,  color: palette.sage,      opacity: 0.17, position: { top: '54%',    left: '1%'  }, depth: 18, restRotate: 7,   ambientDelay: 3.6 },
  { type: 'cube',         size: 74,  color: palette.pistachio, opacity: 0.15, position: { top: '62%',    right: '-1%'}, depth: 12, restRotate: 6,   ambientDelay: 5.4 },
  // ── Lower band ──
  { type: 'octahedron',   size: 88,  color: palette.sage,      opacity: 0.18, position: { bottom: '30%', left: '5%'  }, depth: 18, restRotate: -8,  ambientDelay: 1.6 },
  { type: 'geosphere',    size: 86,  color: palette.sage,      opacity: 0.17, position: { bottom: '16%', right: '2%' }, depth: 16, restRotate: 0,   ambientDelay: 4.6 },
  { type: 'tetrahedron',  size: 72,  color: palette.mint,      opacity: 0.16, position: { bottom: '20%', left: '-2%' }, depth: 13, restRotate: 10,  ambientDelay: 3.4 },
  { type: 'geosphere',    size: 96,  color: palette.sage,      opacity: 0.17, position: { bottom: '9%',  left: '2%'  }, depth: 16, restRotate: 0,   ambientDelay: 4.2 },
  { type: 'cube',         size: 70,  color: palette.pistachio, opacity: 0.15, position: { bottom: '7%',  right: '5%' }, depth: 12, restRotate: 6,   ambientDelay: 5   },
  { type: 'cube',         size: 66,  color: palette.pistachio, opacity: 0.15, position: { bottom: '4%',  left: '9%'  }, depth: 11, restRotate: 6,   ambientDelay: 5.2 },
  // ── Lower-middle — in the bottom padding, below the share card (negative space) ──
  { type: 'tetrahedron',  size: 64,  color: palette.mint,      opacity: 0.16, position: { bottom: '1%',  left: '45%' }, depth: 12, restRotate: 8,   ambientDelay: 2.8 },
];

export function ResultsAtmosphere() {
  const reduce = useReducedMotion();
  const { pointerX, pointerY } = usePointerParallax(reduce);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {/* 1 — Soft mesh blooms */}
      {BLOOMS.map((b, i) => {
        const driftProps = reduce
          ? {}
          : {
              animate: {
                x: b.drift.x,
                y: b.drift.y,
                scale: b.drift.scale,
              } as TargetAndTransition,
              transition: {
                duration: b.duration,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'easeInOut',
              } as Transition,
            };
        return (
          <motion.div
            key={`bloom-${i}`}
            className="absolute rounded-full"
            style={{
              ...b.position,
              width: b.size,
              height: b.size,
              background: `radial-gradient(circle, ${b.color} 0%, transparent 70%)`,
              filter: 'blur(40px)',
            }}
            {...driftProps}
          />
        );
      })}

      {/* 2 — Floating wireframes — desktop only, where the side whitespace lives */}
      <div className="absolute inset-0 hidden lg:block">
        {SHAPES.map((s, i) => (
          <GeometryShape
            key={`shape-${i}`}
            type={s.type}
            size={s.size}
            color={s.color}
            opacity={s.opacity}
            strokeWidth={RESULTS_STROKE}
            position={s.position}
            depth={s.depth}
            restRotate={s.restRotate}
            ambient={!reduce}
            ambientDelay={s.ambientDelay}
            pointerX={pointerX}
            pointerY={pointerY}
            reduce={reduce}
          />
        ))}
      </div>
    </div>
  );
}

export default ResultsAtmosphere;
