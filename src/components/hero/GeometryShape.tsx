'use client';

import { motion, useTransform, type MotionValue } from 'framer-motion';
import { GEOMETRY_SHAPES, type GeometryType } from './geometry-shapes';

/**
 * GeometryShape — a single reusable wireframe polyhedron (Phase 6.2).
 *
 * Motion model (premium + intentional, no perpetual motion):
 *   Default → static, with a slight resting rotation offset for organic feel
 *   Pointer → subtle proximity parallax from the parent layer (reactive)
 *   Hover   → slow CSS-3D rotate + gentle spring + subtle scale (0.8–1.5s)
 *   Exit    → springs smoothly back to its resting position
 *
 * No spinning loops, no float loop, NO glow/blur. Reduced-motion → fully static.
 */

export interface GeometryShapeProps {
  type: GeometryType;
  /** Rendered pixel size (60 → 180 per the brief). */
  size: number;
  color: string;
  /** Absolute placement inside the geometry layer. */
  position: Partial<Record<'top' | 'left' | 'right' | 'bottom', string>>;
  /** Shared, spring-smoothed pointer offsets in the range -1..1. */
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
  /** Parallax depth (px of travel at full pointer offset). */
  depth?: number;
  /** Static resting z-rotation (deg) so shapes look casually placed. */
  restRotate?: number;
  /** Stroke/vertex opacity override (0..1). Defaults to the existing look. */
  opacity?: number | undefined;
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
  restRotate = 0,
  opacity,
  reduce = false,
  className = '',
}: GeometryShapeProps) {
  const shape = GEOMETRY_SHAPES[type];

  // Existing shapes keep their original look; new shapes can pass a lower,
  // 15–40% opacity for a recessed, layered-depth feel.
  const edgeOpacity = opacity ?? 0.72;
  const vertexOpacity = opacity ?? 0.82;
  // Rear edges of true-3D shapes are dimmed (rounded to avoid float noise).
  const backEdgeOpacity = Math.round(edgeOpacity * 0.42 * 1000) / 1000;

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
      {/* Perspective wrapper (static) */}
      <div className="h-full w-full" style={{ perspective: 700 }}>
        {/* 3D hover rotor — static at rest, reacts only to hover */}
        <motion.div
          className="h-full w-full"
          style={{ transformStyle: 'preserve-3d', rotate: restRotate }}
          whileHover={
            reduce ? {} : { rotateY: 20, rotateX: -10, scale: 1.06 }
          }
          transition={{ type: 'spring', stiffness: 60, damping: 16, mass: 1 }}
        >
          <svg
            viewBox="0 0 100 100"
            width={size}
            height={size}
            fill="none"
            className="h-full w-full"
          >
            {/* Rear edges first, dimmed — gives true-3D shapes visible depth */}
            {shape.backEdges?.map((e, i) => (
              <line
                key={`b-${i}`}
                x1={e[0]}
                y1={e[1]}
                x2={e[2]}
                y2={e[3]}
                stroke={color}
                strokeWidth={1.25}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                opacity={backEdgeOpacity}
              />
            ))}
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
                opacity={edgeOpacity}
              />
            ))}
            {shape.vertices.map((v, i) => (
              <circle
                key={`v-${i}`}
                cx={v[0]}
                cy={v[1]}
                r={2.1}
                fill={color}
                opacity={vertexOpacity}
              />
            ))}
          </svg>
        </motion.div>
      </div>
    </motion.div>
  );
}
