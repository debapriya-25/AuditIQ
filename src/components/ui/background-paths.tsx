'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { greenRamp, palette } from '@/lib/theme/colors';

/**
 * background-paths — animated SVG path field (Phase 6.2).
 *
 * Adapted from the kokonutd "Background Paths" pattern (21st.dev) and fully
 * rebranded for AuditIQ: green ramp only, very low opacity (0.03 → 0.15),
 * smooth slow motion, no flashing / glow / blur. It is a supporting layer —
 * decorative (aria-hidden), pointer-events-none, absolutely positioned behind
 * all hero content so it never covers text or competes with CTAs.
 *
 * Lightweight: SVG + Framer Motion only (no Three.js / WebGL / particles).
 */

const PATHS_PER_SIDE = 20;

interface PathDef {
  id: number;
  d: string;
  color: string;
  opacity: number;
  width: number;
}

function buildPaths(position: number): PathDef[] {
  return Array.from({ length: PATHS_PER_SIDE }, (_, i) => {
    const d = `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`;

    return {
      id: i,
      d,
      color: greenRamp[i % greenRamp.length] ?? palette.bottle,
      // 0.03 → ~0.15 across the set; deeper greens slightly stronger.
      opacity: Math.min(0.15, 0.03 + (i / PATHS_PER_SIDE) * 0.12),
      width: 0.6 + i * 0.04,
    };
  });
}

function FloatingPaths({
  position,
  reduce,
}: {
  position: number;
  reduce: boolean;
}) {
  const paths = buildPaths(position);

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 696 316"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {paths.map((p) =>
        reduce ? (
          <path
            key={p.id}
            d={p.d}
            stroke={p.color}
            strokeWidth={p.width}
            strokeOpacity={p.opacity}
            fill="none"
          />
        ) : (
          <motion.path
            key={p.id}
            d={p.d}
            stroke={p.color}
            strokeWidth={p.width}
            fill="none"
            initial={{ pathLength: 0.3, opacity: 0 }}
            animate={{
              pathLength: 1,
              opacity: [0, p.opacity, p.opacity * 0.7],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              // Deterministic (no Math.random) to avoid hydration drift.
              duration: 26 + (p.id % 6) * 3,
              repeat: Infinity,
              repeatType: 'loop',
              ease: 'easeInOut',
            }}
          />
        )
      )}
    </svg>
  );
}

export function FloatingPathsBackground({
  className = '',
}: {
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <FloatingPaths position={1} reduce={reduce} />
      <FloatingPaths position={-1} reduce={reduce} />
    </div>
  );
}

export default FloatingPathsBackground;
