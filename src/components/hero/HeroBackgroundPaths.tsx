'use client';

import { motion } from 'framer-motion';
import { auditiqGreens } from '@/lib/theme/colors';

/**
 * HeroBackgroundPaths — reusable animated SVG path field (Phase 6.1).
 *
 * A heavy reinterpretation of the generic "background paths" pattern, retuned
 * for AuditIQ: green palette, low opacity, slow elegant motion. The streams
 * gently converge toward the right (where savings surface) so they read as
 * "financial flows / optimization routes" — not hacker lines or cyber grids.
 *
 * Visual intensity is deliberately ~40% lower than a typical paths background
 * (few lines, thin strokes, 0.05–0.16 opacity). Sits behind hero content and
 * is decorative (aria-hidden). Static + dimmed for reduced-motion users.
 */

const VIEW_W = 1200;
const VIEW_H = 600;
const STREAM_COUNT = 9;

interface StreamPath {
  d: string;
  color: string;
  opacity: number;
  duration: number;
  delay: number;
}

/** Build gentle left→right streams that converge toward the right third. */
function buildStreams(): StreamPath[] {
  return Array.from({ length: STREAM_COUNT }, (_, i) => {
    const t = i / (STREAM_COUNT - 1); // 0..1
    const startY = 60 + t * (VIEW_H - 120); // spread down the left edge
    const convergeY = VIEW_H * 0.42 + (t - 0.5) * 120; // pull toward right-centre
    const c1x = VIEW_W * 0.28;
    const c1y = startY - 40 + t * 30;
    const c2x = VIEW_W * 0.66;
    const c2y = convergeY + 60;

    const d = `M ${-80} ${startY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${VIEW_W + 80} ${convergeY}`;

    const color = auditiqGreens[i % auditiqGreens.length] ?? auditiqGreens[0];
    // Lower, dimmer opacity for the lighter greens; emphasis on darker flows.
    const opacity = 0.06 + (1 - t) * 0.1;

    return {
      d,
      color,
      opacity: Math.min(0.16, opacity),
      duration: 22 + i * 2.5,
      delay: i * 0.5,
    };
  });
}

const STREAMS = buildStreams();

export function HeroBackgroundPaths({
  reduce = false,
  className = '',
}: {
  reduce?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <svg
        className="h-full w-full"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {STREAMS.map((s, i) =>
          reduce ? (
            <path
              key={i}
              d={s.d}
              stroke={s.color}
              strokeWidth={1.25}
              strokeLinecap="round"
              opacity={s.opacity * 0.7}
              vectorEffect="non-scaling-stroke"
            />
          ) : (
            <motion.path
              key={i}
              d={s.d}
              stroke={s.color}
              strokeWidth={1.25}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0.35, opacity: 0 }}
              animate={{
                pathLength: [0.35, 1, 0.6],
                opacity: [0, s.opacity, s.opacity * 0.55],
              }}
              transition={{
                duration: s.duration,
                delay: s.delay,
                repeat: Infinity,
                repeatType: 'loop',
                ease: 'easeInOut',
              }}
            />
          )
        )}
      </svg>
    </div>
  );
}
