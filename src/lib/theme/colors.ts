/**
 * AuditIQ centralized color system — Phase 6.1 (Premium Hero).
 *
 * Single source of truth for the "executive financial" palette. Consumed by:
 *   - tailwind.config.ts  → utility classes (bg-cream, text-bottle-green, …)
 *   - globals.css         → CSS custom properties (--aiq-*)
 *   - TS / SVG runtime    → background paths + geometry strokes (need raw hex)
 *
 * Palette intent:
 *   Backgrounds → warm, paper-like (cream / beige / ivory)
 *   Greens      → animated + decorative + interactive surfaces
 *   Chocolate   → highlighted financial metrics only
 *   Ink         → derived dark-brown body text (WCAG AA on cream)
 *
 * Hard rules (see Phase 6.1 brief): never bright blue, never neon.
 */
export const auditiq = {
  // ── Backgrounds ──
  cream: '#FAF7F0',
  beige: '#F3EEE4',
  ivory: '#FFFDF8',

  // ── Greens ──
  sage: '#A8C3A0',
  mint: '#BFE3C0',
  pistachio: '#CDE7B0',
  bottleGreen: '#1F4D36',
  sapGreen: '#507D4F',

  // ── Accent ──
  chocolate: '#5C4033',

  // ── Derived ink (body text) ──
  ink: '#33291F',
} as const;

export type AuditIQColorKey = keyof typeof auditiq;

/** Ordered green ramp used by the background-path + geometry systems. */
export const auditiqGreens = [
  auditiq.bottleGreen,
  auditiq.sapGreen,
  auditiq.sage,
  auditiq.pistachio,
  auditiq.mint,
] as const;

/** kebab-cased map spread into Tailwind `theme.extend.colors`. */
export const auditiqTailwindColors = {
  cream: auditiq.cream,
  beige: auditiq.beige,
  ivory: auditiq.ivory,
  sage: auditiq.sage,
  mint: auditiq.mint,
  pistachio: auditiq.pistachio,
  'bottle-green': auditiq.bottleGreen,
  'sap-green': auditiq.sapGreen,
  chocolate: auditiq.chocolate,
  ink: auditiq.ink,
} as const;
