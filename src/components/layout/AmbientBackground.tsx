'use client';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/* ── Dynamic imports — SSR disabled for all 3D ── */
const SceneWrapper = dynamic(
  () => import('@/components/3d/SceneWrapper'),
  { ssr: false }
);
const GridScene = dynamic(
  () => import('@/components/3d/GridScene'),
  { ssr: false }
);

/**
 * AmbientBackground — Manages route-specific 3D scenes.
 * Renders dynamically imported R3F canvases with reduced-motion fallback.
 */
export function AmbientBackground() {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  // No 3D for reduced-motion users — AuroraBackground CSS handles the ambient
  if (prefersReducedMotion) return null;

  return (
    <>
      {/* Phase 6.1: the landing hero ('/') now owns its own cream surface +
          lightweight SVG/CSS-3D geometry, so the R3F HeroScene sphere is no
          longer mounted here. Other routes' 3D scenes are unchanged. */}
      {pathname === '/audit' && (
        <SceneWrapper>
          <GridScene />
        </SceneWrapper>
      )}
    </>
  );
}
