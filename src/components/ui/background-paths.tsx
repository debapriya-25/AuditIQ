'use client';

import { useEffect, useState } from 'react';
import { motion, PresenceContext } from 'framer-motion';
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
    const d = `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position
      } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position
      } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position
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
              // Every animated value is a SEAMLESS keyframe array — the first
              // and last entries match (pathLength 0.3→0.3, opacity, pathOffset
              // 0→0) — so each loop boundary is continuous. The previous
              // opacity ramp from 0 made the paths fade fully out at the start
              // of every cycle, which read as the "dead time" between cycles.
              pathLength: [0.3, 1, 0.3],
              opacity: [p.opacity * 0.5, p.opacity, p.opacity * 0.5],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              // Deterministic (no Math.random) to avoid hydration drift.
              // 11–16s: alive and continuous without feeling frantic
              // (was 26–41s, which left long, lifeless gaps).
              duration: 11 + (p.id % 6),
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

  // ── Animation-timeline fix (Phase 6.4D) — the real root cause ──
  // This field renders deep inside <AppShell>'s PageTransitionLayer, which wraps
  // every route in <AnimatePresence initial={false}>. In Framer Motion,
  // `initial={false}` is broadcast to ALL descendants via PresenceContext: any
  // motion.* present on that AnimatePresence's first commit reads
  // `PresenceContext.initial === false` and renders straight at its `animate`
  // target WITHOUT creating an animation timeline (verified in the browser:
  // motion.path[i].getAnimations() === [], elements sit at their animate-state
  // opacity, never the initial opacity:0). A route change mounts a NEW keyed
  // AnimatePresence child whose presence `initial` is not false, which is why
  // navigating away and back makes the paths suddenly animate.
  //
  // Resetting PresenceContext to `null` for this subtree detaches the paths from
  // that inherited `initial={false}`, so they run their normal mount animation
  // and a real timeline is created on first load — no refresh, no navigation.
  //
  // The post-mount flag is retained so the motion paths always initialise as a
  // clean client mount; the empty wrapper renders identically on server and
  // first client render, so there is no hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {mounted && (
        <PresenceContext.Provider value={null}>
          <>
            <FloatingPaths position={1} reduce={reduce} />
            <FloatingPaths position={-1} reduce={reduce} />
          </>
        </PresenceContext.Provider>
      )}
    </div>
  );
}

export default FloatingPathsBackground;
