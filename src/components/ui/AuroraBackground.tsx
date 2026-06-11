'use client';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * AuroraBackground — warm cream/green ambient layer that sits behind every page
 * as the global base surface. MVP is light-only: there is intentionally no dark
 * or navy variant here, so route transitions and first paint always rest on
 * cream (never a black/navy flash). Individual pages still paint their own
 * opaque cream surfaces on top; this is the safety net beneath them.
 */
export function AuroraBackground() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="fixed inset-0 -z-30 overflow-hidden bg-cream" aria-hidden="true">
      {/* Warm cream → ivory → beige base */}
      <div className="absolute inset-0 bg-[radial-gradient(125%_125%_at_50%_0%,#FFFDF8_0%,#FAF7F0_46%,#F3EEE4_100%)]" />

      {!prefersReducedMotion && (
        <>
          {/* Soft sage bloom — top right */}
          <div
            className="absolute -top-1/4 -right-1/4 h-[760px] w-[760px] rounded-full opacity-[0.18] animate-aurora-shift"
            style={{
              background:
                'radial-gradient(circle, rgba(168,195,160,0.45) 0%, rgba(191,227,192,0.20) 45%, transparent 70%)',
              backgroundSize: '200% 200%',
            }}
          />

          {/* Pistachio bloom — center left */}
          <div
            className="absolute left-[-15%] top-1/3 h-[620px] w-[620px] rounded-full opacity-[0.14] animate-aurora-shift"
            style={{
              background:
                'radial-gradient(circle, rgba(205,231,176,0.40) 0%, rgba(168,195,160,0.16) 50%, transparent 70%)',
              backgroundSize: '200% 200%',
              animationDelay: '-4s',
              animationDuration: '14s',
            }}
          />
        </>
      )}
    </div>
  );
}
