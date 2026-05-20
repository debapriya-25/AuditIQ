'use client';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { cn } from '@/lib/utils';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  tiltDeg?: number;
}

export function TiltCard({ children, className, tiltDeg = 8 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 200, damping: 30 });
  const springY = useSpring(y, { stiffness: 200, damping: 30 });

  const rotateX = useTransform(springY, [-0.5, 0.5], [tiltDeg, -tiltDeg]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-tiltDeg, tiltDeg]);

  // Glare must be computed via useTransform (hook) — never conditionally
  const glareBackground = useTransform(
    [springX, springY],
    ([mx, my]) =>
      `radial-gradient(circle at ${((mx as number) + 0.5) * 100}% ${((my as number) + 0.5) * 100}%, rgba(255,255,255,0.08) 0%, transparent 60%)`
  );

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (prefersReducedMotion) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  // Reduced motion: render static card, no tilt
  if (prefersReducedMotion) {
    return (
      <div className={cn('relative', className)}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      className={cn('relative', className)}
    >
      {/* Glare overlay */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[var(--radius-card)] z-10"
        style={{ background: glareBackground }}
      />
      {children}
    </motion.div>
  );
}
