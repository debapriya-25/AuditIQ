'use client';

import { motion, useTransform, type MotionValue } from 'framer-motion';
import { GEOMETRY_SHAPES, type GeometryType } from './geometry-shapes';

/**
 * GeometryShape — a single reusable wireframe polyhedron (Phase 6.1).
 *
 * Movement budget (premium + intentional only):
 *   Idle   → almost motionless, very slight vertical float
 *   Hover  → slow CSS-3D rotate + slight scale + soft green glow
 *   Exit   → springs back to rest (Framer reverts whileHover)
 *   Pointer→ subtle proximity parallax driven by the parent layer
 *
 * No infinite spinning / constant rotation. Reduced-motion → fully static.
 */

export interface GeometryShapeProps {
  type: GeometryType;
  /** Rendered pixel size (60 / 100 / 140 / 180 per the brief). */
  size: number;
  color: string;
  /** Absolute placement inside the geometry layer. */
  position: Partial<Record<'top' | 'left' | 'right' | 'bottom', string>>;
  /** Shared, spring-smoothed pointer offsets in the range -1..1. */
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  /** Parallax depth (px of travel at full pointer offset). */
  depth?: number;
  /** Seconds for one idle float cycle. */
  floatDuration?: number;
  floatDelay?: number;
  reduce?: boolean;
  className?: string;
}

export function GeometryShape({
  type,
  size,
  color,
  position,
  pointerX,
  pointerY,
  depth = 16,
  floatDuration = 8,
  floatDelay = 0,
  reduce = false,
  className = '',
}: GeometryShapeProps) {
  const shape = GEOMETRY_SHAPES[type];

  // Proximity parallax — hooks run unconditionally; only applied when motion on.
  const x = useTransform(pointerX, [-1, 1], [-depth, depth]);
  const y = useTransform(pointerY, [-1, 1], [-depth, depth]);

  return (
    <motion.div
      aria-hidden="true"
      className={`absolute ${className}`}
      style={{
        ...position,
        width: size,
        height: size,
        ...(reduce ? {} : { x, y }),
      }}
    >
      {/* Float layer */}
      <motion.div
        className="h-full w-full"
        style={{ perspective: 700 }}
        animate={reduce ? {} : { y: [0, -7, 0] }}
        transition={
          reduce
            ? {}
            : {
                duration: floatDuration,
                delay: floatDelay,
                repeat: Infinity,
                ease: 'easeInOut',
              }
        }
      >
        {/* 3D hover rotor */}
        <motion.div
          className="h-full w-full"
          style={{ transformStyle: 'preserve-3d' }}
          whileHover={
            reduce
              ? {}
              : {
                  rotateY: 26,
                  rotateX: -14,
                  scale: 1.08,
                  filter: `drop-shadow(0 8px 18px ${color}40)`,
                }
          }
          transition={{ type: 'spring', stiffness: 110, damping: 14 }}
        >
          <svg
            viewBox="0 0 100 100"
            width={size}
            height={size}
            fill="none"
            className="h-full w-full"
          >
            {shape.edges.map((e, i) => (
              <line
                key={`e-${i}`}
                x1={e[0]}
                y1={e[1]}
                x2={e[2]}
                y2={e[3]}
                stroke={color}
                strokeWidth={1.5}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                opacity={0.85}
              />
            ))}
            {shape.vertices.map((v, i) => (
              <circle
                key={`v-${i}`}
                cx={v[0]}
                cy={v[1]}
                r={2.1}
                fill={color}
                opacity={0.95}
              />
            ))}
          </svg>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
