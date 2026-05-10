# frontend_guidelines.md — AI Spend Audit Tool
### Frontend Design & Implementation Guidelines

**Version:** 1.0  
**Project:** AI Spend Audit — Credex Web Dev Intern Assignment  
**Stack:** Next.js 14 · TypeScript · Tailwind CSS · Framer Motion · shadcn/ui · Three.js / React Three Fiber

---

## Table of Contents

1. [Design Philosophy & Aesthetic Direction](#1-design-philosophy--aesthetic-direction)
2. [3D Design System — Core Concept](#2-3d-design-system--core-concept)
3. [Color System](#3-color-system)
4. [Typography System](#4-typography-system)
5. [3D Elements & Three.js / R3F Guidelines](#5-3d-elements--threejs--r3f-guidelines)
6. [CSS 3D — Transform-based Depth](#6-css-3d--transform-based-depth)
7. [Animation & Motion System](#7-animation--motion-system)
8. [Component Design Specifications](#8-component-design-specifications)
9. [Page-by-Page Visual Specifications](#9-page-by-page-visual-specifications)
10. [Layout System](#10-layout-system)
11. [Responsive & Mobile Guidelines](#11-responsive--mobile-guidelines)
12. [Accessibility Requirements](#12-accessibility-requirements)
13. [Performance Constraints](#13-performance-constraints)
14. [Tailwind Configuration](#14-tailwind-configuration)
15. [File & Folder Structure](#15-file--folder-structure)
16. [Implementation Checklist](#16-implementation-checklist)

---

## 1. Design Philosophy & Aesthetic Direction

### The Vision

AI Spend Audit is not a spreadsheet tool. It is a **financial discovery moment** — the first time a startup founder or engineering manager truly sees where their AI budget is leaking. The interface must match that sense of discovery: something that feels genuinely powerful and fun to interact with, not another flat SaaS dashboard.

The aesthetic direction is: **"Fintech Control Room meets Spatial Computing"** — inspired by the glass-and-depth UI language emerging from visionOS/Apple Vision Pro and high-end fintech apps like Robinhood's web interface and Linear's product. Every surface has weight. Every card has depth. Numbers feel physical, like they're sitting on a table in front of you.

**The experience should feel like:**
- Opening a Bloomberg Terminal for the first time — dense with intelligence but immediately readable
- Using a glass instrument panel on a spaceship — clean, glowing, precise
- Receiving a premium audit report from a consulting firm — authoritative, polished, trustworthy

**NOT:**
- A generic SaaS landing page with purple gradients
- A flat Figma mockup someone turned into HTML
- A shadcn/ui default theme with no customization

### Core Aesthetic Principles

**1. Glassmorphism with Real Depth**  
Cards are not flat rectangles. They are frosted glass panels floating at different depths in Z-space. Use `backdrop-filter: blur()`, layered box-shadows with multiple levels, and subtle border highlights to simulate glass surfaces catching light.

**2. Physicality of Numbers**  
Savings amounts, spend totals, and percentages are the stars of the UI. They must feel *weighty* — large, bold, with subtle drop-shadows and number-count-up animations that make them feel like they're being computed in real time.

**3. Deliberate Darkness**  
The primary theme is **dark** — a near-black background with deep navy midtones. This makes the glowing cards and bright savings numbers pop dramatically. It also reads as "serious tool for serious professionals."

**4. Interactive 3D Geometry**  
At key moments — the landing page hero, the results page hero block, loading states — there are real 3D geometries rendered with React Three Fiber. Not decorative stock images, not gradient blobs: actual 3D objects that respond to mouse movement and feel alive.

**5. Purposeful Animation**  
Every animation serves the user's understanding. Cards stagger-in to signal "your audit is being computed." The savings number counts up to land the impact. Nothing animates just for decoration.

---

## 2. 3D Design System — Core Concept

### The Floating Layer Architecture

The entire UI is built around a three-layer depth model. Think of the screen as having genuine Z-depth:

```
Layer Z+2 (Foreground)  — Active modals, tooltips, toasts, CTAs
Layer Z+1 (Content)     — Cards, form panels, result tiles
Layer Z0  (Base)        — Page background, 3D canvas
Layer Z-1 (Depth)       — Background geometry, particle field
```

Each layer has distinct visual treatment:

| Layer | Background | Border | Shadow |
|---|---|---|------|
| Z+2 | `rgba(255,255,255,0.12)` blur(20px) | 1px `rgba(255,255,255,0.25)` | `0 25px 50px rgba(0,0,0,0.5)` |
| Z+1 | `rgba(255,255,255,0.06)` blur(12px) | 1px `rgba(255,255,255,0.12)` | `0 8px 32px rgba(0,0,0,0.35)` |
| Z0  | Base color gradient | none | none |
| Z-1 | Transparent (3D canvas renders here) | none | none |

### The Three.js Background Canvas

A full-screen `<Canvas>` from `@react-three/fiber` sits at `position: fixed; z-index: -1` and renders on every page. The scene changes per page context:

**Landing Page Scene:** A slowly rotating icosahedron made of glowing wireframe edges, surrounded by a sparse particle field. Subtle mouse parallax — the geometry tilts slightly toward the cursor.

**Audit Form Scene:** A quieter background — a flat grid of very faint lines (like a trading terminal's chart grid) that gently scrolls upward, giving a sense of live data processing.

**Results Page Scene:** The hero block gets the most dramatic treatment — a 3D bar chart (representing the savings per tool) rendered in Three.js *behind* the hero card, visible through the frosted glass. The bars animate up when the page loads.

**Shared/Public Page Scene:** Same as results but with a subtle revolving ring of floating coins/dollar-sign geometries to communicate "money savings."

---

## 3. Color System

### Design Token Reference

Define these in `tailwind.config.ts` under `theme.extend.colors` and mirror them as CSS custom properties in `globals.css`.

```css
:root {
  /* Base Palette */
  --color-void:        #080C14;   /* Deepest background */
  --color-abyss:       #0D1320;   /* Card backgrounds */
  --color-depth:       #141B2D;   /* Form panel backgrounds */
  --color-surface:     #1C2540;   /* Elevated card surface */
  --color-overlay:     #232E4F;   /* Hover states, selection */

  /* Glass Layer Colors */
  --glass-bg:          rgba(20, 27, 45, 0.65);
  --glass-border:      rgba(120, 160, 255, 0.12);
  --glass-highlight:   rgba(255, 255, 255, 0.08);
  --glass-blur:        12px;

  /* Accent Palette */
  --color-signal:      #3B82F6;   /* Primary blue — CTAs, links */
  --color-signal-glow: rgba(59, 130, 246, 0.25);
  --color-emerald:     #10B981;   /* Savings / Optimal / Success */
  --color-ember:       #F59E0B;   /* Overspending / Warning */
  --color-crimson:     #EF4444;   /* Switch Recommended / Error */
  --color-violet:      #8B5CF6;   /* AI summary block accent */
  --color-ice:         #BAE6FD;   /* Hero number color (large savings) */

  /* Savings Tier Colors */
  --tier-high-bg:      rgba(16, 185, 129, 0.08);
  --tier-high-border:  rgba(16, 185, 129, 0.30);
  --tier-high-glow:    rgba(16, 185, 129, 0.15);
  --tier-mid-bg:       rgba(245, 158, 11, 0.08);
  --tier-mid-border:   rgba(245, 158, 11, 0.30);
  --tier-low-bg:       rgba(59, 130, 246, 0.08);
  --tier-low-border:   rgba(59, 130, 246, 0.25);

  /* Typography */
  --text-primary:      #F0F4FF;
  --text-secondary:    #8B99BE;
  --text-muted:        #4A5568;
  --text-accent:       #93C5FD;

  /* Spacing & Radius */
  --radius-card:       16px;
  --radius-btn:        10px;
  --radius-badge:      6px;

  /* Glow Effects */
  --glow-signal:       0 0 20px rgba(59, 130, 246, 0.4);
  --glow-emerald:      0 0 20px rgba(16, 185, 129, 0.4);
  --glow-ember:        0 0 20px rgba(245, 158, 11, 0.4);
}
```

### Color Usage Rules

**Backgrounds:** Never use a solid `#000000` or `#ffffff`. The background is always `--color-void` with a subtle radial gradient toward `--color-abyss` in the center.

**Text:** Primary text is `--text-primary` (#F0F4FF — slightly blue-tinted white). Secondary labels use `--text-secondary`. Never use pure `#FFFFFF` for body text.

**Savings Numbers:** The hero savings amount uses `--color-ice` for the dollar sign and `--text-primary` for the number, with a subtle `text-shadow: 0 0 30px rgba(186, 230, 253, 0.5)` glow.

**Status Colors:**
- `optimal` → `--color-emerald` with `--tier-high-bg` card background
- `overspending` → `--color-ember` with `--tier-mid-bg` card background
- `switch_recommended` → `--color-crimson` — but don't use the card `--tier-mid-bg`; use a subtle gradient from `rgba(239, 68, 68, 0.06)` to transparent

**Buttons:** Primary CTA uses `--color-signal` background with a `box-shadow: var(--glow-signal)` on hover. The glow should animate on hover using a CSS transition.

---

## 4. Typography System

### Font Choices

**Display Font — "Clash Display"** (or alternative: "Syne")
- Used for: Hero savings numbers, page headings, tool names in result cards
- Weight: 600–700
- Source: `https://api.fontshare.com/v2/css?f[]=clash-display@600,700`
- Character: Geometric, slightly futuristic, authoritative. Pairs perfectly with the fintech control-room aesthetic.

**Monospace Font — "JetBrains Mono"**  
- Used for: Dollar amounts, plan names, pricing data, savings numbers in detail rows
- Weight: 400, 600
- Source: `next/font/google` → `JetBrains_Mono`
- Character: Signals precision and data-accuracy. When prices are shown in a monospace font, they feel more trustworthy.

**Body Font — "DM Sans"**
- Used for: All body text, form labels, descriptions, AI summary paragraph
- Weight: 300, 400, 500
- Source: `next/font/google` → `DM_Sans`
- Character: Friendly but professional. Clean without being cold.

### Type Scale

```typescript
// In tailwind.config.ts theme.extend.fontSize
{
  'display-2xl': ['72px', { lineHeight: '1.0', letterSpacing: '-0.03em', fontWeight: '700' }],
  'display-xl':  ['56px', { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '700' }],
  'display-lg':  ['40px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
  'display-md':  ['32px', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '600' }],
  'display-sm':  ['24px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
  'body-lg':     ['18px', { lineHeight: '1.7', letterSpacing: '0' }],
  'body-md':     ['16px', { lineHeight: '1.65', letterSpacing: '0' }],
  'body-sm':     ['14px', { lineHeight: '1.6', letterSpacing: '0.01em' }],
  'label':       ['12px', { lineHeight: '1.5', letterSpacing: '0.06em', fontWeight: '500' }],
  'mono-lg':     ['20px', { lineHeight: '1.4', fontFamily: 'var(--font-jetbrains)' }],
  'mono-md':     ['16px', { lineHeight: '1.4', fontFamily: 'var(--font-jetbrains)' }],
  'mono-sm':     ['13px', { lineHeight: '1.4', fontFamily: 'var(--font-jetbrains)' }],
}
```

### Typography Usage Rules

**Hero Savings Number:** `text-display-2xl` (72px) on desktop, `text-display-xl` (56px) on tablet, `text-display-lg` (40px) on mobile. Font: Clash Display. Color: `--color-ice` for "$" prefix, `--text-primary` for the rest.

**Section Headings:** `text-display-md` (32px). Font: Clash Display.

**Card Tool Name:** `text-display-sm` (24px). Font: Clash Display.

**Pricing Data:** Always `font-mono` (JetBrains Mono). This is non-negotiable — pricing numbers must be in monospace.

**AI Summary Block:** `text-body-lg` (18px), Font: DM Sans at weight 300 (light). This creates a deliberate contrast with the bold data elsewhere — the AI narration feels editorial, not tabular.

**Labels / Tags:** `text-label` (12px, uppercase, letter-spacing 0.06em). Used for "OPTIMAL", "MONTHLY SPEND", "POTENTIAL SAVINGS" labels.

---

## 5. 3D Elements & Three.js / R3F Guidelines

### Package Installation

```bash
npm install three @react-three/fiber @react-three/drei
npm install -D @types/three
```

**Pinned version:** `three@0.169.0`, `@react-three/fiber@8.17.10`, `@react-three/drei@9.117.3`

### R3F Canvas Architecture

Every Three.js scene is wrapped in a `<Suspense>` boundary with a lightweight CSS fallback (the base gradient) to prevent hydration issues.

```tsx
// src/components/3d/SceneWrapper.tsx
'use client';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';

interface SceneWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function SceneWrapper({ children, className }: SceneWrapperProps) {
  return (
    <div className={`fixed inset-0 -z-10 ${className}`} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 1.5]}        // Cap at 1.5x DPR for performance
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
}
```

### Scene: Landing Page Hero — Floating Icosahedron

A wireframe icosahedron that slowly rotates and tilts toward the mouse cursor. Surrounded by 150 small point particles.

```tsx
// src/components/3d/HeroScene.tsx
'use client';
import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

export function HeroScene() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();

  useFrame((state) => {
    if (!meshRef.current) return;
    // Slow base rotation
    meshRef.current.rotation.y += 0.003;
    meshRef.current.rotation.x += 0.001;
    // Mouse parallax — gentle tilt toward cursor
    meshRef.current.rotation.y += (pointer.x * 0.3 - meshRef.current.rotation.y) * 0.02;
    meshRef.current.rotation.x += (-pointer.y * 0.2 - meshRef.current.rotation.x) * 0.02;
  });

  // Particle positions
  const particles = useMemo(() => {
    const count = 150;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return positions;
  }, []);

  return (
    <>
      {/* Ambient + Point Light for glow effect */}
      <ambientLight intensity={0.2} />
      <pointLight position={[3, 3, 3]} intensity={1.5} color="#3B82F6" />
      <pointLight position={[-3, -2, 1]} intensity={0.8} color="#8B5CF6" />

      {/* Wireframe Icosahedron */}
      <mesh ref={meshRef} position={[2.5, 0.5, -1]}>
        <icosahedronGeometry args={[1.8, 1]} />
        <meshStandardMaterial
          color="#3B82F6"
          wireframe={true}
          emissive="#3B82F6"
          emissiveIntensity={0.4}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* Second smaller orbiting sphere */}
      <mesh position={[-2, -1, -2]}>
        <octahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial
          color="#8B5CF6"
          wireframe={true}
          emissive="#8B5CF6"
          emissiveIntensity={0.3}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Particle Field */}
      <Points positions={particles} stride={3}>
        <PointMaterial
          color="#BAE6FD"
          size={0.025}
          sizeAttenuation
          transparent
          opacity={0.6}
        />
      </Points>
    </>
  );
}
```

### Scene: Results Page — 3D Savings Bar Chart

A 3D bar chart rendered *behind* the hero card glass, visible through the blur. Each bar corresponds to one tool's savings amount. Bars animate upward on mount.

```tsx
// src/components/3d/SavingsBarScene.tsx
'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSpring, animated } from '@react-spring/three';

interface BarProps {
  position: [number, number, number];
  height: number;
  color: string;
  delay: number;
}

function SavingsBar({ position, height, color, delay }: BarProps) {
  const { scaleY } = useSpring({
    from: { scaleY: 0 },
    to: { scaleY: 1 },
    delay,
    config: { tension: 120, friction: 14 }
  });

  return (
    <animated.mesh position={position} scale-y={scaleY}>
      <boxGeometry args={[0.4, height, 0.4]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
        transparent
        opacity={0.75}
        roughness={0.2}
        metalness={0.5}
      />
    </animated.mesh>
  );
}
```

**Note:** Install `@react-spring/three@9.x` alongside R3F for spring-based 3D animations.

### Scene: Form Page — Grid Background

A subtle, calming 3D grid rendered at low opacity to give the sense of a live financial terminal.

```tsx
// src/components/3d/GridScene.tsx
// Uses @react-three/drei's <Grid> helper
import { Grid } from '@react-three/drei';

export function FormGridScene() {
  return (
    <Grid
      position={[0, -3, 0]}
      args={[30, 30]}
      cellSize={1}
      cellThickness={0.3}
      cellColor="#1C2540"
      sectionSize={5}
      sectionThickness={0.6}
      sectionColor="#232E4F"
      fadeDistance={20}
      fadeStrength={1}
      infiniteGrid
    />
  );
}
```

### R3F Performance Rules

1. **DPR Cap:** Always set `dpr={[1, 1.5]}` — never `dpr={[1, 2]}`. Retina rendering of 3D is expensive.
2. **Geometry Reuse:** Use `useMemo` for geometry creation. Never create geometries inside `useFrame`.
3. **Dispose:** Call `geometry.dispose()` and `material.dispose()` in `useEffect` cleanup.
4. **Pixel Ratio:** On low-power mobile devices (`navigator.hardwareConcurrency <= 4`), render a static CSS gradient fallback instead of the 3D canvas.
5. **Canvas Visibility:** Use an `IntersectionObserver` to pause rendering when the canvas is not in the viewport.
6. **No Canvas on Results Cards:** The 3D savings bar chart is behind the hero block only — individual tool cards use CSS 3D transforms, not R3F.

---

## 6. CSS 3D — Transform-based Depth

Beyond Three.js scenes, many interactive depth effects are achieved with CSS `transform: translateZ()`, `rotateX()`, `rotateY()`, and `perspective`. This is cheaper than WebGL and works everywhere.

### Card Hover Tilt Effect

Every result card and tool row in the form should have a 3D tilt on hover using Framer Motion's `useMotionValue` + `useTransform`:

```tsx
// src/components/ui/TiltCard.tsx
'use client';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';

export function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring-smooth the raw mouse values
  const springX = useSpring(x, { stiffness: 200, damping: 30 });
  const springY = useSpring(y, { stiffness: 200, damping: 30 });

  // Map mouse position to rotation (max ±8deg)
  const rotateX = useTransform(springY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-8, 8]);
  const glareX  = useTransform(springX, [-0.5, 0.5], ['0%', '100%']);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
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
      className={className}
    >
      {/* Glare overlay */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-[--radius-card] z-10"
        style={{
          background: useTransform(
            [springX, springY],
            ([mx, my]) =>
              `radial-gradient(circle at ${((mx as number) + 0.5) * 100}% ${((my as number) + 0.5) * 100}%, rgba(255,255,255,0.08) 0%, transparent 60%)`
          ),
        }}
      />
      {children}
    </motion.div>
  );
}
```

### Glass Card Base Style

The foundational card component used throughout the app:

```tsx
// src/components/ui/GlassCard.tsx
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'sunken';
}

const variants = {
  default:  'bg-[rgba(20,27,45,0.65)] border border-[rgba(120,160,255,0.12)]',
  elevated: 'bg-[rgba(28,37,64,0.75)] border border-[rgba(120,160,255,0.20)] shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
  sunken:   'bg-[rgba(8,12,20,0.80)] border border-[rgba(120,160,255,0.08)]',
};

export function GlassCard({ children, className, variant = 'default' }: GlassCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-[16px] backdrop-blur-[12px]',
        variants[variant],
        className
      )}
    >
      {/* Top edge highlight — simulates light hitting the top of the glass */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-[16px]" />
      {children}
    </div>
  );
}
```

### CSS 3D Hero Number Float

The hero savings number should appear to float above the card surface using a subtle CSS 3D transform that shifts on scroll:

```tsx
// In the hero block, wrap the number:
<motion.div
  style={{ transformStyle: 'preserve-3d', translateZ: '20px' }}
  initial={{ opacity: 0, translateZ: '40px', translateY: '-10px' }}
  animate={{ opacity: 1, translateZ: '20px', translateY: '0px' }}
  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
>
  <span className="font-display text-display-2xl text-[--color-ice] drop-shadow-[0_0_30px_rgba(186,230,253,0.5)]">
    ${savings.toLocaleString()}
  </span>
</motion.div>
```

---

## 7. Animation & Motion System

### Framer Motion Configuration

All Framer Motion variants are defined in `src/lib/animations.ts` and imported by components — never defined inline in JSX.

```typescript
// src/lib/animations.ts
import type { Variants } from 'framer-motion';

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
  }
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

export const cardReveal: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] }
  }
};

export const numberCountUp = {
  initial: 0,
  // Used with Framer Motion's useAnimationFrame + spring for counter animation
};

export const glowPulse: Variants = {
  idle: { boxShadow: '0 0 0px rgba(59,130,246,0)' },
  hover: { boxShadow: '0 0 24px rgba(59,130,246,0.4), 0 0 48px rgba(59,130,246,0.15)' }
};

export const scalePress: Variants = {
  tap: { scale: 0.97 }
};

export const shimmer = {
  // CSS keyframe defined in globals.css, not Framer Motion
};
```

### Number Counter Animation

The hero savings number must count up from 0 to the final value on page load. Use Framer Motion's `useMotionValue` + `useTransform` + `animate`:

```tsx
// src/components/ui/AnimatedNumber.tsx
'use client';
import { useEffect } from 'react';
import { useMotionValue, useTransform, animate, motion } from 'framer-motion';

export function AnimatedNumber({ value, prefix = '$' }: { value: number; prefix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1],  // Custom expo-out easing
      delay: 0.3,
    });
    return controls.stop;
  }, [value]);

  return (
    <span className="font-display tabular-nums">
      {prefix}<motion.span>{rounded}</motion.span>
    </span>
  );
}
```

### Page Transitions

Use Next.js App Router's `layout.tsx` wrapping with a Framer Motion `<AnimatePresence>`:

```tsx
// src/app/layout.tsx additions
<AnimatePresence mode="wait">
  <motion.main
    key={pathname}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25, ease: 'easeInOut' }}
  >
    {children}
  </motion.main>
</AnimatePresence>
```

### Animation Performance Rules

1. **GPU-only properties:** Only animate `opacity`, `transform` (translate, scale, rotate), and `filter: blur()`. Never animate `width`, `height`, `top`, `left`, `margin`, or `padding` — these trigger layout reflow.
2. **`will-change`:** Apply `will-change: transform, opacity` to cards that will animate on mount, but remove it after animation completes (to free GPU memory).
3. **`prefers-reduced-motion`:** All animations must respect the OS reduced-motion preference. Wrap animation variants in a check:
```tsx
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const animationVariants = prefersReduced ? {} : cardReveal;
```
4. **Stagger cap:** Never stagger more than 8 items simultaneously. If there are more tool cards than 8, only stagger the first 4 and show the rest instantly.

### Specific Animation Catalogue

| Element | Animation | Duration | Easing |
|---|---|---|---|
| Hero savings number | Count up from 0 | 1.8s | expo-out |
| Per-tool cards | Stagger fade-in-up | 0.45s each, 80ms stagger | expo-out |
| AI summary reveal | Fade in after skeleton | 0.4s | ease-in-out |
| CTA button hover | Glow box-shadow + scale(1.02) | 0.2s | ease-out |
| Status badge pop | Scale 0 → 1 with bounce | 0.35s | spring (200/15) |
| Copy button success | Text swap + checkmark | instant | n/a |
| Toast entry | Slide in from top-right | 0.3s | spring |
| Toast exit | Slide out + fade | 0.25s | ease-in |
| Form submit loading | Button width expand + spinner | 0.3s | ease-in-out |
| Form field shake (error) | translateX oscillation | 0.4s | CSS keyframe |
| 3D card tilt | Spring-follow cursor | continuous | spring(200/30) |
| Navbar scroll effect | backdrop-blur + shadow | 0.2s | ease-out |
| Running total number | Instant update (no anim) | — | — |
| Skeleton shimmer | L→R gradient sweep | 1.5s loop | linear |
| Page transition | Fade + 8px Y shift | 0.25s | ease-in-out |

---

## 8. Component Design Specifications

### 8.1 Navigation Bar

**Structure:** Frosted glass bar, sticky, `position: sticky; top: 0; z-index: 50`.

**Resting state:**
- Background: `transparent` (the 3D scene shows through)
- Border: none

**Scrolled state (after 20px scroll):**
- Background: `rgba(8, 12, 20, 0.85)` with `backdrop-filter: blur(16px)`
- Border-bottom: `1px solid rgba(120, 160, 255, 0.10)`
- Box-shadow: `0 1px 0 rgba(120, 160, 255, 0.05)`
- Transition: `all 0.3s ease`

**Logo:** "SpendScan" or chosen name in Clash Display weight 700, color `--text-primary`. Optionally prefix with a glowing dot: `●` in `--color-signal`.

**CTA Button (navbar):** Small, ghost style — border `1px solid rgba(59,130,246,0.4)`, text `--color-signal`. On hover: background `rgba(59,130,246,0.1)`, border opacity increases.

---

### 8.2 Primary CTA Button

```tsx
// The main "Audit my AI spend" button
<motion.button
  variants={glowPulse}
  initial="idle"
  whileHover="hover"
  whileTap={{ scale: 0.97 }}
  className="relative px-8 py-4 rounded-[10px] bg-[--color-signal] text-white font-medium text-body-md overflow-hidden group"
>
  {/* Animated shine sweep on hover */}
  <motion.div
    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
  />
  <span className="relative z-10">Audit my AI spend — free, no account needed</span>
</motion.button>
```

**Disabled state:** `opacity-40 cursor-not-allowed` — no glow, no hover effects.

**Loading state:** The button text transforms with a width animation to accommodate the spinner. The spinner is a `border-t-2 border-white rounded-full w-4 h-4 animate-spin` element fading in.

---

### 8.3 Tool Result Card

The most important component. Each card surfaces one tool's audit result.

**Anatomy (top to bottom):**

```
┌─────────────────────────────────────────────┐  ← Left colored border (3px solid)
│  [Tool Logo 32px]  Tool Name      [Badge]   │  ← Header row
│                                             │
│  Currently paying: $152 / month             │  ← Monospace, secondary color
│                                             │
│  ──────────────────────────────────────     │  ← Divider
│                                             │
│  Recommended action text here, 1-2          │  ← Body text, weight 300
│  sentences, plain English.                  │
│                                             │
│  Reason: One sentence rationale.            │  ← Smaller, muted color
│                                             │
│  ┌─────────────────────┐                   │
│  │  Save $XXX / month  │                   │  ← Savings pill, accent color
│  └─────────────────────┘                   │
└─────────────────────────────────────────────┘
```

**Visual states:**

```css
/* Optimal card */
.card-optimal {
  border-left: 3px solid var(--color-emerald);
  background: var(--tier-high-bg);
}
.card-optimal:hover {
  border-left-color: var(--color-emerald);
  box-shadow: -4px 0 24px var(--tier-high-glow);
}

/* Overspending card */
.card-overspending {
  border-left: 3px solid var(--color-ember);
  background: var(--tier-mid-bg);
}

/* Switch Recommended card */
.card-switch {
  border-left: 3px solid var(--color-crimson);
  background: linear-gradient(135deg, rgba(239,68,68,0.06) 0%, transparent 60%);
}
```

---

### 8.4 Status Badge

Three variants, using a pill shape with colored background and icon:

```tsx
const badgeConfig = {
  optimal:            { label: 'Optimal',          icon: '✓', bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  overspending:       { label: 'Overspending',     icon: '⚠', bg: 'bg-amber-500/15',   text: 'text-amber-400',   border: 'border-amber-500/30' },
  switch_recommended: { label: 'Switch Recommended', icon: '→', bg: 'bg-red-500/15',   text: 'text-red-400',     border: 'border-red-500/30' },
};

<motion.span
  initial={{ scale: 0, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-label border ${badgeConfig[status].bg} ${badgeConfig[status].text} ${badgeConfig[status].border}`}
>
  <span>{badgeConfig[status].icon}</span>
  {badgeConfig[status].label}
</motion.span>
```

---

### 8.5 Savings Pill

Appears at the bottom of non-optimal cards:

```tsx
<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/25">
  <span className="text-emerald-400 text-mono-md font-semibold">
    Save ${savings.toLocaleString()} / mo
  </span>
  <span className="text-emerald-300/60 text-label">→ ${(savings * 12).toLocaleString()}/yr</span>
</div>
```

---

### 8.6 AI Summary Block

**Design intent:** This card must feel qualitatively different from the data cards — more editorial, like a letter from an expert.

- Background: `rgba(139, 92, 246, 0.06)` with border `rgba(139, 92, 246, 0.20)`
- Left accent: 3px solid `--color-violet` with a `box-shadow: -4px 0 20px rgba(139,92,246,0.2)`
- Top label: small "AI SUMMARY" label in `--color-violet` with a pulsing `●` dot
- Body text: DM Sans weight 300, 18px, `--text-secondary` color
- Loading state: 3 skeleton bars in the purple color family

**Pulsing dot for "AI generated" indicator:**
```css
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.4; transform: scale(0.85); }
}
.ai-indicator-dot {
  width: 6px; height: 6px;
  background: var(--color-violet);
  border-radius: 50%;
  animation: pulse-dot 2s ease-in-out infinite;
}
```

---

### 8.7 Hero Block (Results Page)

This is the most visually impactful component in the entire app.

**Visual layers (back to front):**
1. **Three.js savings bar chart** — rendered in the background WebGL canvas, partially visible through the frosted glass
2. **Frosted glass panel** — `backdrop-filter: blur(20px)`, `background: rgba(8,12,20,0.7)`
3. **Savings content** — animated number, tier label, sub-stats
4. **Floating 3D number effect** — `transform: translateZ(20px)` gives the number a floating appearance above the card

**Layout:**
```
┌──────────────────────────────────────────────────────────────┐
│  Your AI Spend Audit                                         │
│                                                              │
│         You could save                                       │
│         $X,XXX  /month                    ← 72px Clash Display
│         That's $XX,XXX per year           ← 24px DM Sans
│                                                              │
│  Based on 5 tools · Coding team of 8     ← 12px label       │
│                                                              │
│                               [Share this audit →]          │
└──────────────────────────────────────────────────────────────┘
```

**Color treatment of hero by savings tier:**
- **High (>$500):** Emerald green glow — `--tier-high-glow` bleeds into the card edges. The "You could save" text is `--color-emerald`.
- **Mid ($100–$500):** Amber glow treatment. The number uses `--color-ember`.
- **Low (<$100):** Blue/neutral — `--color-signal` glow. Clean and informational.
- **Zero:** White/neutral text. "Your AI spend looks optimized." No glow effect.

---

### 8.8 Credex CTA Block (Tier A — High Savings)

This is the conversion moment. It must feel urgent and premium simultaneously.

```
┌──────────────────────────────────────────────────────────────┐
│  ////  CREDEX  ////                       ← brand stripe top │
│                                                              │
│  You're leaving $9,600 on the table                         │
│  every year.                              ← 32px bold       │
│                                                              │
│  Credex sells discounted AI credits from companies          │
│  that overforecast their AI usage. Your team could          │
│  access Claude, Cursor, and ChatGPT at up to 40% off.       │
│                                                              │
│  [Book a free Credex consultation →]      ← Primary CTA     │
│  Learn more about how Credex works →      ← Text link       │
└──────────────────────────────────────────────────────────────┘
```

**Visual treatment:** This card uses a gradient background — `linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(59,130,246,0.08) 100%)` — with a `border: 1px solid rgba(16,185,129,0.3)` and a `box-shadow: 0 0 60px rgba(16,185,129,0.08)` outer glow.

The top stripe ("////  CREDEX  ////") is a repeating diagonal hatching pattern created with CSS `repeating-linear-gradient`.

---

### 8.9 Form Tool Row

Each tool row in the audit form is its own glass card that enters with a stagger animation when added:

```
┌──────────────────────────────────────────────────────────────┐
│  [Tool Logo]  [Tool Dropdown ▼]  [Plan ▼]  [Seats #]  [×]   │
│              ──────────────────────────────────────────────  │
│              Monthly spend:  [$___  USD]                     │
└──────────────────────────────────────────────────────────────┘
```

On hover, the card gets a very subtle tilt (max ±2deg — much less dramatic than results cards).

When a new row is added (`+ Add tool` clicked), it animates in with:
```tsx
initial={{ opacity: 0, height: 0, y: -10 }}
animate={{ opacity: 1, height: 'auto', y: 0 }}
transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
```

When removed, it animates out with:
```tsx
exit={{ opacity: 0, height: 0, x: -20, transition: { duration: 0.25 } }}
```

Wrap the list of tool rows in `<AnimatePresence>` with `mode="sync"`.

---

### 8.10 Skeleton Loader

Three-line skeleton for the AI summary, plus a full-card skeleton for when the results page is loading audit data:

```tsx
export function SummarySkeleton() {
  return (
    <div role="status" aria-busy="true" aria-label="Loading AI summary..." className="space-y-3">
      {[100, 88, 62].map((width, i) => (
        <div
          key={i}
          className="h-4 rounded-full bg-[rgba(139,92,246,0.12)] overflow-hidden"
          style={{ width: `${width}%` }}
        >
          <div className="h-full w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-[rgba(139,92,246,0.20)] to-transparent" />
        </div>
      ))}
    </div>
  );
}
```

```css
/* globals.css */
@keyframes shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(50%); }
}
.animate-shimmer { animation: shimmer 1.5s ease-in-out infinite; }
```

---

### 8.11 Toast Notifications

Position: `fixed top-4 right-4` on desktop, `fixed bottom-4 left-4 right-4` on mobile.

```tsx
// Using Sonner (recommended over shadcn toast for this aesthetic)
// npm install sonner
import { Toaster } from 'sonner';

// In layout.tsx:
<Toaster
  theme="dark"
  position="top-right"
  toastOptions={{
    style: {
      background: 'rgba(20,27,45,0.90)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(120,160,255,0.15)',
      color: '#F0F4FF',
      borderRadius: '12px',
    }
  }}
/>
```

---

## 9. Page-by-Page Visual Specifications

### 9.1 Landing Page `/`

**Background:** Full-screen `HeroScene` (icosahedron + particles). Base gradient: `radial-gradient(ellipse 80% 60% at 50% 30%, rgba(59,130,246,0.08) 0%, var(--color-void) 70%)`.

**Hero Section Layout:**
- Max-width: `1100px`, centered
- Left column (60%): Headline, subheadline, CTA, social proof
- Right column (40%): A floating 3D card showing a mock audit result (CSS `perspective` tilt, not R3F), with the Framer Motion tilt effect applied

The mock result card on the right side IS the "screenshot bait" — it uses `TiltCard` with some pre-populated example data (GitHub Copilot → Individual → Save $152/mo), rendered in full visual fidelity.

**How It Works Section:**
Three floating glass cards in a row, each containing a step number (1, 2, 3) in `--color-signal`, step title in Clash Display, and description in DM Sans. Between cards, a subtle animated arrow `→` in `--text-muted` pulses from left to right.

**Tool Logo Grid:**
Logos arranged in a single row on desktop, wrapping on mobile. Each logo is 40×40px, displayed in `grayscale(40%)` at rest, `grayscale(0%)` on hover with a brief scale(1.1) bounce.

**FAQ Accordion:**
The shadcn `Accordion` component, styled with the glass card aesthetic. Each item has a `+` → `×` icon transition (Framer Motion `rotate`). Only one item open at a time.

---

### 9.2 Audit Form `/audit`

**Background:** `FormGridScene` (subtle 3D grid). Base: `--color-void`.

**Form Container:** Max-width `680px`, centered. Single column.

**Progress Indicator:**
Two steps: `① Enter your tools` → `② See your audit`. The active step uses `--color-signal` text and an underline. The inactive step uses `--text-muted`.

**Running Total Bar (Desktop):** Sticky `position: sticky; top: 80px` panel to the right of the form (visible on viewport > 1100px). Glass card style. Shows live monthly + annual totals.

**Running Total Bar (Mobile):** `position: fixed; bottom: 0; left: 0; right: 0` — a slim bar above the submit button area. `z-index: 40`. Semi-transparent with blur.

**Submit Button area:** Full-width on mobile. On desktop, right-aligned within the form max-width.

---

### 9.3 Results Page `/results/[auditId]`

**Background:** `position: fixed; inset: 0; z-index: -1` Three.js canvas with the savings bar chart scene.

**Page structure (scroll order):**
1. Hero Block (full-width, glass)
2. Per-Tool Cards (stagger-animated, `max-width: 800px`)
3. AI Summary Block
4. Credex CTA (conditional)
5. Email Capture Section
6. Share Block

**Overall vertical rhythm:** `gap-6` between sections on desktop (24px). `gap-4` on mobile.

---

### 9.4 Share Page `/share/[auditId]`

Identical visual treatment to the results page, with two additions:

**Top Banner:** A slim info strip at the very top of the page (not the navbar). Background: `rgba(59,130,246,0.08)`, border-bottom `rgba(59,130,246,0.15)`. Contains: "Viewing a shared audit — identifying details removed." and a "Run your own →" ghost button.

**Watermark:** A faint "Shared via SpendScan" text at the very bottom of the results content, in `--text-muted` color, `text-label` size. This is the viral branding mark.

---

### 9.5 Error Pages (404 / 500)

**Design:** Center-aligned on the screen. Minimal. The 3D icosahedron scene from the landing page renders in the background, but rotated 180° (upside down — a visual metaphor for "something's wrong"). The icosahedron wireframe is rendered in `--color-crimson` instead of `--color-signal`.

---

## 10. Layout System

### Container Widths

```typescript
// tailwind.config.ts
screens: {
  'sm':  '640px',
  'md':  '768px',
  'lg':  '1024px',
  'xl':  '1280px',
  '2xl': '1536px',
},
// Custom container variants via max-width classes:
// max-w-form:    680px   (audit form)
// max-w-results: 800px   (results cards)
// max-w-landing: 1100px  (landing page content)
```

### Z-Index Scale

```typescript
// Define in tailwind.config.ts theme.extend.zIndex
{
  'below':   '-10',  // 3D canvas
  'base':    '0',
  'content': '10',   // Regular content
  'sticky':  '20',   // Sticky running total bar
  'nav':     '50',   // Navbar
  'modal':   '100',  // Modals, overlays
  'toast':   '200',  // Toast notifications
}
```

### Grid & Spacing

The entire app uses **8px base spacing** (`1 unit = 8px` in Tailwind's scale). Never use odd spacing values. Typical values: `p-4` (16px), `p-6` (24px), `p-8` (32px), `gap-6` (24px), `gap-8` (32px).

---

## 11. Responsive & Mobile Guidelines

### Breakpoints and Layout Changes

| Viewport | Navbar | Hero | Tool Rows | Running Total |
|---|---|---|---|---|
| < 640px (mobile) | Logo + icon CTA | Single column, stacked | Fields stack vertically | Fixed bottom bar |
| 640–1024px (tablet) | Full | Single column | Fields in 2-col grid | Below form (static) |
| > 1024px (desktop) | Full | Two-column (text + mock card) | Fields in single horizontal row | Sticky side panel |

### Mobile-Specific Rules

1. **Touch targets:** All interactive elements minimum `44×44px` per WCAG. Buttons use `min-h-[44px]`.
2. **3D on Mobile:** The full Three.js scenes run on mobile but with reduced particle count (50 instead of 150) and DPR capped at `1`. On devices with `navigator.hardwareConcurrency <= 2`, disable the 3D canvas and show a CSS gradient fallback.
3. **Hero savings number:** Scales down: `text-display-xl` (56px) on tablet, `text-display-lg` (40px) on mobile.
4. **TiltCard on mobile:** The 3D tilt effect is disabled on touch devices (no hover). The card renders flat. Tapping a card shows a brief scale-down (0.98) via `whileTap`.
5. **Font loading:** Use `next/font` with `display: 'swap'` for all custom fonts to prevent FOIT on slow connections.

---

## 12. Accessibility Requirements

Target: **Lighthouse Accessibility ≥ 90** on mobile, deployed URL.

### Non-Negotiable Rules

1. **Focus rings:** Every focusable element must have a visible focus ring. Use `focus-visible:ring-2 focus-visible:ring-[--color-signal] focus-visible:ring-offset-2 focus-visible:ring-offset-[--color-void]` globally.

2. **Color contrast:** Minimum 4.5:1 ratio for all body text against its background. Use `--text-primary` (#F0F4FF) on `--color-depth` (#141B2D) — ratio is 10.2:1. Never use `--text-muted` for any meaningful information (labels only).

3. **Icon-only buttons:** The `×` remove button on tool rows and the `Copy` icon button must have `aria-label` attributes.

4. **3D canvas:** The Three.js `<Canvas>` element must have `aria-hidden="true"` — it is decorative. Screen readers must not encounter it.

5. **Status badges:** Never rely on color alone. Each badge has both an icon and text label.

6. **Skeleton loaders:** `role="status"`, `aria-busy="true"`, `aria-label="Loading [content name]..."`.

7. **Form labels:** Every input has an associated `<label>` — not just a placeholder. For the segmented use-case selector, use `role="radiogroup"` with `aria-label="Primary use case"` and individual `role="radio"` elements.

8. **Animated number counter:** The `<AnimatedNumber>` component must render the final value immediately in the DOM for screen readers, using `aria-live="polite"`. The visual animation is a layer on top.

9. **Accordion FAQ:** Use the shadcn Accordion which uses proper `<button>` elements with `aria-expanded` and `aria-controls`.

10. **Reduced motion:** Wrap all Framer Motion animations in a `useReducedMotion()` check. If `true`, skip all enter animations and disable the 3D canvas scenes.

---

## 13. Performance Constraints

Lighthouse Performance target: **≥ 85** on mobile, deployed URL.

### Bundle Size Budgets

| Category | Budget |
|---|---|
| First Load JS (main page) | < 250 KB gzipped |
| Three.js + R3F | Loaded via dynamic import with `{ ssr: false }` |
| Framer Motion | < 40 KB gzipped (already tree-shaken) |
| CSS (Tailwind JIT output) | < 15 KB gzipped |

### Critical Performance Rules

1. **Three.js lazy loading:** The R3F `<Canvas>` must be loaded with `next/dynamic`:
```tsx
const HeroSceneWrapper = dynamic(
  () => import('@/components/3d/HeroScene').then(m => m.HeroScene),
  { ssr: false, loading: () => null }
);
```
This prevents Three.js from being included in the initial server bundle.

2. **Images:** All tool logos must be SVG (vector, tiny file size) or WebP via `next/image`. Logos used in the OG image can be PNG.

3. **Font loading:** Use `next/font/google` for DM Sans and JetBrains Mono. Clash Display is served from fontshare.com via a `<link rel="preconnect">` in `app/layout.tsx`.

4. **Critical CSS:** Tailwind JIT ensures no unused CSS ships. Do not use `@apply` for complex animations — use inline `style` or CSS-in-JS instead, as `@apply` can bloat the CSS output.

5. **`prefers-reduced-motion` + 3D fallback:** The motion check must be done server-side via a cookie or client-side on first paint — never cause a hydration mismatch.

6. **Suspense boundaries:** Every async component (AI summary, audit data fetch) must have a `<Suspense>` wrapper to prevent the whole page from blocking.

---

## 14. Tailwind Configuration

### `tailwind.config.ts` — Complete Configuration

```typescript
import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void:     '#080C14',
        abyss:    '#0D1320',
        depth:    '#141B2D',
        surface:  '#1C2540',
        overlay:  '#232E4F',
        signal:   '#3B82F6',
        emerald:  { DEFAULT: '#10B981', dim: 'rgba(16,185,129,0.15)' },
        ember:    { DEFAULT: '#F59E0B', dim: 'rgba(245,158,11,0.15)' },
        crimson:  { DEFAULT: '#EF4444', dim: 'rgba(239,68,68,0.15)' },
        violet:   { DEFAULT: '#8B5CF6', dim: 'rgba(139,92,246,0.15)' },
        ice:      '#BAE6FD',
      },
      fontFamily: {
        display: ['var(--font-clash)', ...fontFamily.sans],
        body:    ['var(--font-dm-sans)', ...fontFamily.sans],
        mono:    ['var(--font-jetbrains)', ...fontFamily.mono],
      },
      fontSize: {
        'display-2xl': ['72px', { lineHeight: '1.0', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-xl':  ['56px', { lineHeight: '1.05', letterSpacing: '-0.025em' }],
        'display-lg':  ['40px', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md':  ['32px', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
        'display-sm':  ['24px', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'label':       ['12px', { lineHeight: '1.5', letterSpacing: '0.06em', fontWeight: '500', textTransform: 'uppercase' }],
      },
      borderRadius: {
        'card': '16px',
        'btn':  '10px',
        'badge': '6px',
      },
      boxShadow: {
        'glass':      '0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
        'glass-lg':   '0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
        'glow-signal':'0 0 24px rgba(59,130,246,0.4)',
        'glow-emerald':'0 0 24px rgba(16,185,129,0.4)',
        'glow-ember':  '0 0 24px rgba(245,158,11,0.4)',
      },
      backdropBlur: {
        'glass': '12px',
        'heavy': '20px',
      },
      animation: {
        'shimmer':    'shimmer 1.5s ease-in-out infinite',
        'pulse-dot':  'pulse-dot 2s ease-in-out infinite',
        'float':      'float 6s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(50%)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%':       { opacity: '0.4', transform: 'scale(0.85)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};

export default config;
```

---

## 15. File & Folder Structure

Frontend-relevant files and folders:

```
src/
├── app/
│   ├── layout.tsx               ← Global fonts, ThemeProvider, Toaster, AnimatePresence
│   ├── globals.css              ← CSS variables, @keyframes, base resets
│   ├── page.tsx                 ← Landing page
│   ├── audit/
│   │   └── page.tsx             ← Form page
│   ├── results/[auditId]/
│   │   └── page.tsx             ← Private results page
│   └── share/[auditId]/
│       └── page.tsx             ← Public share page
│
├── components/
│   ├── 3d/
│   │   ├── SceneWrapper.tsx     ← R3F Canvas wrapper (client, lazy)
│   │   ├── HeroScene.tsx        ← Landing icosahedron + particles
│   │   ├── FormGridScene.tsx    ← Audit form subtle grid
│   │   └── SavingsBarScene.tsx  ← Results 3D bar chart
│   │
│   ├── ui/                      ← Reusable design system components
│   │   ├── GlassCard.tsx
│   │   ├── TiltCard.tsx
│   │   ├── AnimatedNumber.tsx
│   │   ├── SummarySkeleton.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── SavingsPill.tsx
│   │   └── CopyButton.tsx
│   │
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   │
│   ├── landing/
│   │   ├── HeroSection.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── ToolLogoGrid.tsx
│   │   ├── SampleAuditCard.tsx
│   │   └── FAQAccordion.tsx
│   │
│   ├── audit/
│   │   ├── AuditForm.tsx
│   │   ├── ToolRow.tsx
│   │   ├── UseCaseSelector.tsx
│   │   └── RunningTotalBar.tsx
│   │
│   └── results/
│       ├── HeroBlock.tsx
│       ├── ToolResultCard.tsx
│       ├── AISummaryBlock.tsx
│       ├── CredexCTA.tsx
│       ├── EmailCapture.tsx
│       └── ShareBlock.tsx
│
└── lib/
    ├── animations.ts            ← Framer Motion variants (centralized)
    └── utils.ts                 ← cn() and other helpers
```

---

## 16. Implementation Checklist

Use this as a pre-submission visual QA checklist.

### Global
- [ ] Dark background (`--color-void`) renders on all pages, no white flash on load
- [ ] CSS variables are defined in `globals.css` and referenced via Tailwind config
- [ ] Clash Display font loads correctly (no fallback flash on desktop)
- [ ] JetBrains Mono renders for all dollar/pricing values
- [ ] Focus rings visible on all interactive elements (keyboard nav test)
- [ ] `prefers-reduced-motion` disables animations and 3D canvas
- [ ] Navbar glass effect triggers after 20px scroll

### 3D / Three.js
- [ ] Three.js canvas loads via `next/dynamic` with `ssr: false`
- [ ] Canvas has `aria-hidden="true"`
- [ ] DPR capped at 1.5
- [ ] Mobile low-power fallback works (CSS gradient shows instead of WebGL)
- [ ] No console errors from Three.js geometry/material disposal

### Landing Page
- [ ] Hero icosahedron rotates and responds to mouse parallax
- [ ] Mock audit card on right side has TiltCard effect
- [ ] How It Works cards are 3-column on desktop, 1-column on mobile
- [ ] FAQ accordion opens/closes with animation
- [ ] "Run your own audit" button in navbar hides on `/audit` page

### Audit Form
- [ ] Tool rows enter with stagger animation on add
- [ ] Tool rows exit with height-collapse animation on remove
- [ ] Running total updates live (no delay/debounce for running total, only for heavy compute)
- [ ] Form persists to localStorage on every change
- [ ] Persistence banner appears when pre-populated from storage
- [ ] Submit button disabled state correctly styled (`opacity-40`, no glow)
- [ ] Loading state (spinner + "Analyzing…") appears on submit
- [ ] Error shake animation fires on failed validation
- [ ] First error scrolls into view on validation failure

### Results Page
- [ ] Hero savings number counts up from 0 with AnimatedNumber
- [ ] Tool cards stagger-animate in sequence (max 4 staggered, rest instant)
- [ ] Status badges pop in with spring animation
- [ ] Hero background color matches savings tier (green/amber/blue)
- [ ] AI summary skeleton shows before API response
- [ ] AI summary fades in after response (no jarring replacement)
- [ ] Credex CTA tier renders correctly based on `totalMonthlySavings`
- [ ] Email form submits and replaces with success state
- [ ] Copy button changes to "✓ Copied!" and reverts after 2s
- [ ] Share URL displayed in read-only input

### Accessibility
- [ ] Lighthouse Accessibility ≥ 90 on `/` (deployed)
- [ ] Lighthouse Accessibility ≥ 90 on `/results/[id]` (deployed)
- [ ] All `<img>` have descriptive `alt`
- [ ] All icon-only buttons have `aria-label`
- [ ] Color contrast ratio ≥ 4.5:1 for all body text (checked via Lighthouse)
- [ ] Form inputs all have associated `<label>` elements
- [ ] Skeleton loaders have `role="status"` and `aria-busy`

### Performance
- [ ] Lighthouse Performance ≥ 85 on mobile (deployed)
- [ ] Three.js is NOT in the initial bundle (verify in Next.js bundle analyzer)
- [ ] No layout shift caused by font loading (`display: swap` confirmed)
- [ ] Images use `next/image` with explicit width/height

---

*This document is the authoritative frontend design reference for the AI Spend Audit tool. All visual and interaction decisions made during development should trace back to a guideline here. Deviations must be documented in `DEVLOG.md` with rationale.*
