'use client';

/**
 * AmbientBackground — placeholder for route-specific ambient 3D scenes.
 *
 * Phase 6.1+: the landing hero ('/') owns its own cream surface + lightweight
 * SVG/CSS geometry, and the audit form ('/audit') is a focused cream surface
 * with no dark WebGL layer (the previous GridScene clashed with the warm
 * palette and is intentionally not mounted). This component is kept as the
 * documented seam for re-introducing route-scoped scenes later.
 */
export function AmbientBackground() {
  return null;
}
