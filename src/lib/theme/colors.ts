/**
 * AuditIQ centralized color system — Phase 6.1 / 6.2 (Premium Hero).
 *
 * SINGLE SOURCE OF TRUTH for the "premium financial intelligence" palette.
 * All frontend work must consume colors from here — no hardcoded hex in
 * components. Consumed by:
 *   - tailwind.config.ts  → utility classes (bg-cream, text-bottle, …)
 *   - globals.css         → CSS custom properties (--aiq-*)
 *   - TS / SVG runtime    → background paths + geometry strokes (raw hex)
 *
 * Hard rules: no bright blue, no neon, no glows, no purple, no cyan.
 */
export const palette = {
  // ── Backgrounds ──
  cream: '#FAF7F0',
  beige: '#F3EEE4',
  ivory: '#FFFDF8',

  // ── Greens (light → dark) ──
  pistachio: '#CDE7B0',
  mint: '#BFE3C0',
  sage: '#A8C3A0',
  sap: '#507D4F',
  bottle: '#1F4D36',

  // ── Accent (highlighted metrics only) ──
  chocolate: '#5C4033',

  // ── Derived ink (body text — WCAG AA on cream) ──
  ink: '#33291F',
} as const;

export type PaletteKey = keyof typeof palette;

/** Ordered green ramp (light → dark) for the background-path + geometry systems. */
export const greenRamp = [
  palette.pistachio,
  palette.mint,
  palette.sage,
  palette.sap,
  palette.bottle,
] as const;

/**
 * kebab-cased map spread into Tailwind `theme.extend.colors`.
 * Includes legacy `*-green` aliases so any earlier utility classes keep working.
 */
export const auditiqTailwindColors = {
  cream: palette.cream,
  beige: palette.beige,
  ivory: palette.ivory,
  pistachio: palette.pistachio,
  mint: palette.mint,
  sage: palette.sage,
  sap: palette.sap,
  bottle: palette.bottle,
  chocolate: palette.chocolate,
  ink: palette.ink,
  // Back-compat aliases (Phase 6.1)
  'sap-green': palette.sap,
  'bottle-green': palette.bottle,
} as const;

// ── Back-compat aliases (Phase 6.1 import names) ──
export const auditiq = palette;
export const auditiqGreens = greenRamp;
