'use client';

import { motion, type TargetAndTransition, type Transition } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { usePointerParallax } from '@/hooks/usePointerParallax';
import { GeometryShape } from '@/components/hero/GeometryShape';
import type { GeometryType } from '@/components/hero/geometry-shapes';
import { palette } from '@/lib/theme/colors';

/**
 * AuditAtmosphere — premium ambient background for the /audit form (visual only).
 *
 * Sits behind the form (never over it) as layered, low-distraction depth:
 *   1. Soft floating mesh — sage / mint / pistachio radial blooms, slow drift
 *   2. Floating wireframe polyhedra — slow ambient drift + spring pointer parallax
 *
 * There is intentionally NO flowing line/path animation here: the audit form does
 * NOT reuse the landing hero's FloatingPathsBackground. The bottom-left space that
 * field used to occupy is filled with extra wireframe shapes instead (same system).
 *
 * Palette is restricted to sage / mint / pistachio (no blue, no neon). Motion is
 * Framer Motion only — spring-based for pointer reactivity, gentle easeInOut for
 * the ambient loops — and fully gated on reduced motion. The whole layer is
 * aria-hidden + pointer-events-none so it never touches the form's inputs,
 * focus order, or assistive tech, and the layout is left untouched.
 */

// Soft mesh blooms. rgba mirrors palette sage / mint / pistachio — alpha needs
// rgba, and the hero AuroraBackground establishes the same literal-rgba approach.
interface Bloom {
  color: string;
  size: number;
  position: Partial<Record<'top' | 'left' | 'right' | 'bottom', string>>;
  drift: { x: number[]; y: number[]; scale: number[] };
  duration: number;
}

const BLOOMS: Bloom[] = [
  {
    color: 'rgba(168,195,160,0.22)', // sage
    size: 720,
    position: { top: '-12%', left: '-8%' },
    drift: { x: [0, 38, 0], y: [0, 28, 0], scale: [1, 1.08, 1] },
    duration: 27,
  },
  {
    color: 'rgba(191,227,192,0.20)', // mint
    size: 660,
    position: { bottom: '-14%', right: '-6%' },
    drift: { x: [0, -34, 0], y: [0, -26, 0], scale: [1, 1.1, 1] },
    duration: 33,
  },
  {
    color: 'rgba(205,231,176,0.16)', // pistachio
    size: 560,
    position: { top: '34%', right: '-12%' },
    drift: { x: [0, -22, 0], y: [0, 24, 0], scale: [1, 1.06, 1] },
    duration: 39,
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

// Depth tiers come from size + opacity + parallax depth: smaller, fainter, and
// less reactive shapes read as further back. All shapes live in the side / corner
// whitespace so they never sit behind the central inputs.
const SHAPES: AtmosphereShape[] = [
  { type: 'octahedron',   size: 128, color: palette.sage,      opacity: 0.42, position: { top: '9%',     left: '2%'   }, depth: 24, restRotate: 8,   ambientDelay: 0   },
  { type: 'icosahedron',  size: 94,  color: palette.mint,      opacity: 0.36, position: { top: '47%',    left: '-1%'  }, depth: 17, restRotate: -6,  ambientDelay: 2.5 },
  { type: 'tetrahedron',  size: 74,  color: palette.pistachio, opacity: 0.30, position: { bottom: '13%', left: '4%'   }, depth: 12, restRotate: 10,  ambientDelay: 4   },
  { type: 'dodecahedron', size: 138, color: palette.sage,      opacity: 0.40, position: { top: '7%',     right: '3%'  }, depth: 24, restRotate: -7,  ambientDelay: 1.2 },
  { type: 'prism',        size: 88,  color: palette.mint,      opacity: 0.34, position: { top: '53%',    right: '1%'  }, depth: 16, restRotate: -10, ambientDelay: 3.3 },
  { type: 'cube',         size: 70,  color: palette.pistachio, opacity: 0.30, position: { bottom: '10%', right: '5%'  }, depth: 12, restRotate: 6,   ambientDelay: 5   },
  { type: 'geosphere',    size: 104, color: palette.sage,      opacity: 0.34, position: { bottom: '25%', right: '14%' }, depth: 14, restRotate: 0,   ambientDelay: 2   },

  // ── Bottom-left fill — replaces the removed flowing-path field. Same wireframe
  //    language, palette, and interactivity; small, faint, and spread down the
  //    lower-left so the corner reads balanced without crowding the form or
  //    pulling focus. ──
  { type: 'octahedron',   size: 92,  color: palette.sage,      opacity: 0.38, position: { bottom: '34%', left: '5%'  }, depth: 18, restRotate: -8,  ambientDelay: 1.8 },
  { type: 'geosphere',    size: 86,  color: palette.mint,      opacity: 0.32, position: { bottom: '22%', left: '-4%' }, depth: 13, restRotate: 0,   ambientDelay: 5.2 },
  { type: 'cube',         size: 66,  color: palette.pistachio, opacity: 0.30, position: { bottom: '6%',  left: '7%'  }, depth: 11, restRotate: 6,   ambientDelay: 3.6 },
];

export function AuditAtmosphere() {
  const reduce = useReducedMotion();
  // Shared screen-space pointer parallax (spring-smoothed); same motion system
  // as the results atmosphere so reactivity feels identical across surfaces.
  const { pointerX, pointerY } = usePointerParallax(reduce);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {/* 1 — Floating mesh blooms */}
      {BLOOMS.map((b, i) => {
        // Spread so motion props are absent (not `undefined`) under reduced motion.
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
              filter: 'blur(36px)',
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

export default AuditAtmosphere;
