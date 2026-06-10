# Phase 6.1 — AuditIQ Premium Hero Experience · Walkthrough

A **visual-only** rebuild of the landing hero (`/`). No user flows, API contracts,
audit-engine behaviour, or backend logic were touched. The old dark/blue
"infrastructure" hero (R3F wireframe sphere on a void background) is replaced with
a warm, executive, financial SaaS hero on a cream surface — reference quality:
Stripe / Linear / Notion.

---

## 1. Files changed

### Created
| File | Responsibility |
|---|---|
| `src/lib/theme/colors.ts` | **Centralized color system.** Single source of truth for the palette; exports raw hex (for SVG/JS), an ordered green ramp, and a kebab map for Tailwind. |
| `src/components/hero/geometry-shapes.ts` | Hand-authored 2D wireframe projections (edges + vertices) for icosahedron / octahedron / cube / tetrahedron / prism. |
| `src/components/hero/GeometryShape.tsx` | One reusable wireframe shape: idle float, CSS-3D hover rotate + glow, pointer-proximity parallax, reduced-motion static. |
| `src/components/hero/HeroGeometry.tsx` | Lays out 5 shapes (sizes 60/100/140/180) and drives a shared spring-smoothed pointer parallax that eases back to rest on leave. |
| `src/components/hero/HeroBackgroundPaths.tsx` | Reusable animated SVG path field — green, low-opacity flows converging right ("optimization routes"). |
| `src/components/hero/HeroSavingsCard.tsx` | Hero-side savings visualization: `$6,240/year`, `$1,240/mo → $720/mo`, −42% bar. Count-up on mount. |
| `src/components/hero/Hero.tsx` | Composes the section + staged reveal sequence + responsive split layout. |
| `src/components/hero/index.ts` | Barrel export. |
| `walkthrough.md` | This document. |

### Modified
| File | Change |
|---|---|
| `tailwind.config.ts` | Imports `auditiqTailwindColors` and spreads it into `theme.extend.colors` (legacy dark tokens kept intact). |
| `src/app/globals.css` | Adds an additive `--aiq-*` CSS-variable block mirroring the palette. Nothing existing removed. |
| `src/app/page.tsx` | Replaced the `"AuditIQ Running Successfully"` placeholder with `<Hero />`. |
| `src/components/layout/AmbientBackground.tsx` | Stops mounting the R3F `HeroScene` (the "giant wireframe sphere") on `/`; removed its now-unused dynamic import. `/audit` GridScene unchanged. |
| `src/components/layout/Navbar.tsx` | Re-themed to the light palette (bottle-green text/logo, mint hover, ivory scrolled glass, focus ring). Legibility on cream — white-on-cream was invisible. |
| `src/components/layout/Footer.tsx` | Re-themed to cream surface + ink/bottle-green text. |

### Deliberately NOT touched
API routes, `src/lib/audit/*`, validators, services, repositories, DB, `/audit`
`GridScene`, and `src/components/3d/HeroScene.tsx` (left in place, just no longer
mounted). The forced-dark provider and existing dark UI components are untouched.

---

## 2. Design decisions

- **Cream surface that survives the global dark shell.** `AppShell` still renders a
  fixed dark `AuroraBackground` + `NoiseOverlay`. The hero paints an **opaque** cream
  radial gradient that fully covers the aurora on `/`. To keep the *transparent
  sticky navbar* from exposing a dark band on top, the hero uses `-mt-16 pt-16` so its
  cream background extends up **under** the navbar. This avoids fragile `position:
  fixed` layers that would be captured by the page-transition layer's transform.
- **No Three.js in the hero.** The brief said remove the sphere and cap motion. A
  Three.js scene for 5 small objects with cursor proximity is heavy and hard to make
  reduced-motion-safe. Instead: SVG wireframes + **CSS-3D transforms** (`perspective`,
  `rotateX/Y`, `preserve-3d`) per `frontend_guidelines §6`. Lighter, crisper,
  fully controllable, SSR-safe.
- **Centralized tokens, one source.** `colors.ts` feeds Tailwind (build-time classes)
  and is imported directly for SVG strokes (run-time hex). CSS vars mirror it for any
  raw-CSS needs. Changing a hex in one file updates everything.
- **Savings card is the focal point**, not decoration — it states the promise
  ("AuditIQ finds savings") in the first second. Geometry orbits it; on desktop the
  card sits centered in the right column with shapes at the edges so they never
  occlude it.
- **CTA targets respect existing flows.** Primary "Run Free Audit" → `/audit` (the
  real route, same as the navbar CTA). Secondary "View Sample Report" → `#sample-report`
  anchor on the savings card (no fabricated route, no flow change).

---

## 3. Animation strategy

- **Library:** Framer Motion only (no new deps). Easing reuses the project's
  signature expo-out `[0.16, 1, 0.3, 1]`; interactions use springs.
- **Reveal sequence** (left content is a stagger container, `staggerChildren: 0.12`,
  `delayChildren: 0.08`):
  1. Badge → 2. Headline → 3. Subheadline → 4. CTAs (+ trust line) →
  5. Savings card (`delay 0.7`, fade + rise + slight scale) →
  6. Geometry (`delay 0.95`, fade in).
- **Micro-motion:** card numbers count up over 1.4s; reduction bar animates width
  100% → 58% over 1.1s.
- **Geometry motion budget** (premium, intentional — no infinite spin):
  - *Idle:* a very slight `y: [0,-7,0]` float, long per-shape durations (6.5–9s),
    staggered delays.
  - *Hover:* a single deliberate CSS-3D `rotateY 26° / rotateX -14°` + `scale 1.08` +
    soft green drop-shadow, spring `stiffness 110 / damping 14`.
  - *Exit:* Framer reverts `whileHover` → springs back to rest.
  - *Pointer proximity:* a shared `useSpring`-smoothed offset (−1..1) maps to per-shape
    parallax (depth-scaled); on `pointerleave` it returns to 0 so all shapes ease home.
- **Background paths:** slow looping `pathLength` + opacity pulse (22–43s, staggered),
  intentionally ~40% lower intensity (few thin lines, 0.05–0.16 opacity).
- **Reduced motion:** `useReducedMotion()` gates everything. `initial={false}` renders
  the final layout instantly; floats, parallax, hover transforms, count-ups, and the
  bar animation are all disabled. Background paths render static and dimmed.

---

## 4. Color strategy

Palette (from `src/lib/theme/colors.ts`):

| Role | Tokens | Where used |
|---|---|---|
| Backgrounds | `cream #FAF7F0` · `beige #F3EEE4` · `ivory #FFFDF8` | Hero radial surface, card/badge fills, navbar/footer |
| Greens (decorative) | `sage #A8C3A0` · `mint #BFE3C0` · `pistachio #CDE7B0` | Background paths, geometry strokes, soft fills, hover states |
| Greens (interactive) | `bottle-green #1F4D36` · `sap-green #507D4F` | Primary CTA, headline, links, "optimized" figures |
| Accent (metrics) | `chocolate #5C4033` | Annual savings headline, `−42%`, emphasized "Overpaying" |
| Body ink (derived) | `ink #33291F` | Paragraph + supporting text |

Rules honored: main backgrounds are cream/beige/ivory; animated elements use the green
palette; interactive elements use bottle green; highlighted metrics use chocolate.
**No bright blue, no neon, no glow-on-dark.** Soft shadows only.

---

## 5. Accessibility considerations

- **Semantics:** `<section aria-labelledby="hero-heading">` with a single `<h1 id="hero-heading">`; the trust items are a `<ul>`. CTAs are a real `<Link>` and a real
  in-page anchor (`#sample-report`, with `scroll-mt-28` offset).
- **Keyboard:** both CTAs and the navbar links are natively focusable with visible
  `focus-visible:ring-2 ring-bottle-green ring-offset-2 ring-offset-cream`.
- **Reduced motion:** fully respected (see §3) — no parallax/float/spin/count-up.
- **Decorative layers** (background paths, geometry, icons) are `aria-hidden="true"`;
  hover/proximity effects are mouse-only enhancements, never required for meaning.
- **Contrast on cream `#FAF7F0`** (approx ratios):
  - bottle-green `#1F4D36` ≈ 9:1 (AAA) — headline, CTA text.
  - ink `#33291F` ≈ 11:1 (AAA) — body.
  - chocolate `#5C4033` ≈ 6.6:1 (AA normal, AAA large) — metrics.
  - sap-green `#507D4F` ≈ 3.1:1 — used only for large numerals / non-essential labels,
    not small body text.
- **No horizontal scroll:** hero is `overflow-hidden`; geometry is absolutely
  positioned inside a bounded column; the two smallest shapes are `hidden sm:block`.
- **Responsive:** `lg:grid-cols-2` split (content left / visual right); below `lg` it
  stacks **content first, visual/geometry below** — no overlap.

---

## 6. Screenshots / GIF instructions

The build is verified (`npm run typecheck` clean, `npm run build` succeeds). To
capture visuals:

1. **Start the app**
   ```bash
   npm run dev
   # open http://localhost:3000
   ```
   > Windows note: `next build` and `next dev` both lock `.next/`. Stop the dev server
   > before running `npm run build`, or you'll hit `EPERM: .next/trace`.

2. **Desktop split** — viewport ≥ 1280px. Capture the full hero: badge → headline →
   savings card → orbiting geometry.

3. **Responsive** — DevTools device toolbar:
   - Tablet (~820px): columns stack, content above visual.
   - Mobile (~390px): content first, geometry below, two smallest shapes hidden.

4. **Interaction GIF** — record with ScreenToGif (Windows) / Kap (macOS):
   - Reload to capture the 6-step reveal sequence.
   - Hover a geometry shape → slow 3D tilt + glow, release → spring back.
   - Sweep the cursor across the right column → proximity parallax, leave → ease home.

5. **Reduced motion** — DevTools → Command Palette → "Rendering" → set
   **Emulate CSS `prefers-reduced-motion: reduce`**, reload; confirm the hero renders
   fully static (final layout, no animation).

Suggested asset names if committing: `docs/assets/hero-desktop.png`,
`hero-mobile.png`, `hero-interaction.gif`.
