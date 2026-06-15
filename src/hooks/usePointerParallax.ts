'use client';

import { useEffect } from 'react';
import { useMotionValue, useSpring, type MotionValue } from 'framer-motion';

/**
 * usePointerParallax — shared screen-space pointer tracking for ambient
 * background layers (audit + results atmospheres).
 *
 * Returns spring-smoothed pointer offsets in the range -1..1, normalised against
 * the viewport. MotionValues only — pointer movement never triggers a React
 * re-render. Listens on `window` (callers are pointer-events-none) and eases back
 * to centre when the cursor leaves the document. Disabled under reduced motion.
 *
 * The spring constants are the single source of truth for "movement strength and
 * damping" so every ambient surface reacts identically.
 */
export function usePointerParallax(reduce: boolean): {
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
} {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const pointerX = useSpring(rawX, { stiffness: 70, damping: 20, mass: 0.6 });
  const pointerY = useSpring(rawY, { stiffness: 70, damping: 20, mass: 0.6 });

  useEffect(() => {
    if (reduce) return;
    const clamp = (n: number) => Math.max(-1, Math.min(1, n));
    const onMove = (e: PointerEvent) => {
      rawX.set(clamp((e.clientX / window.innerWidth) * 2 - 1));
      rawY.set(clamp((e.clientY / window.innerHeight) * 2 - 1));
    };
    const onLeave = () => {
      rawX.set(0);
      rawY.set(0);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [reduce, rawX, rawY]);

  return { pointerX, pointerY };
}
