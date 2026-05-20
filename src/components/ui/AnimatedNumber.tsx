'use client';
import { useEffect } from 'react';
import { useMotionValue, useTransform, animate, motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  className?: string;
}

export function AnimatedNumber({ value, prefix = '$', className }: AnimatedNumberProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString());
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      count.set(value);
      return;
    }

    const controls = animate(count, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],  // Custom expo-out easing
      delay: 0.3,
    });
    return controls.stop;
  }, [value, prefersReducedMotion, count]);

  return (
    <span className={`font-display tabular-nums ${className || ''}`}>
      {prefix}<motion.span>{rounded}</motion.span>
    </span>
  );
}
