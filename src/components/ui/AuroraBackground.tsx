'use client';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * AuroraBackground — CSS-only animated aurora gradient mesh.
 * Renders behind all content as a fixed ambient layer.
 * Falls back to a static gradient for reduced-motion users.
 */
export function AuroraBackground() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="fixed inset-0 -z-30 overflow-hidden" aria-hidden="true">
      {/* Base void gradient */}
      <div className="absolute inset-0 bg-[var(--color-void)]" />

      {/* Radial gradient center glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,var(--color-abyss),transparent_70%)]" />

      {/* Aurora orbs — animated blurred gradients */}
      {!prefersReducedMotion ? (
        <>
          {/* Primary blue-indigo orb — top right */}
          <div
            className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full opacity-[0.12] animate-aurora-shift"
            style={{
              background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, rgba(99,102,241,0.2) 40%, transparent 70%)',
              backgroundSize: '200% 200%',
            }}
          />

          {/* Violet-fuchsia orb — center left */}
          <div
            className="absolute top-1/3 -left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.08] animate-aurora-shift"
            style={{
              background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, rgba(217,70,239,0.15) 45%, transparent 70%)',
              backgroundSize: '200% 200%',
              animationDelay: '-3s',
              animationDuration: '12s',
            }}
          />

          {/* Cyan accent orb — bottom */}
          <div
            className="absolute -bottom-1/4 left-1/3 w-[500px] h-[500px] rounded-full opacity-[0.06] animate-aurora-shift"
            style={{
              background: 'radial-gradient(circle, rgba(34,211,238,0.3) 0%, rgba(59,130,246,0.1) 50%, transparent 70%)',
              backgroundSize: '200% 200%',
              animationDelay: '-6s',
              animationDuration: '15s',
            }}
          />
        </>
      ) : (
        /* Static fallback for reduced motion */
        <div className="absolute inset-0 bg-gradient-mesh opacity-[0.08]" />
      )}

      {/* Very subtle grid overlay for spatial depth */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(120,160,255,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(120,160,255,0.15) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}
