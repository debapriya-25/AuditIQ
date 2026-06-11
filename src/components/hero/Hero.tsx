'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { FloatingPathsBackground } from '@/components/ui/background-paths';
import { HeroGeometry } from './HeroGeometry';
import { HeroSavingsCard } from './HeroSavingsCard';

/**
 * Hero — AuditIQ premium hero experience (Phase 6.1 + 6.2 enhancements).
 *
 * Executive / financial / trustworthy SaaS aesthetic on a warm cream surface.
 * Visual-only: no flows, API contracts, or audit-engine behaviour are touched.
 * Phase 6.2 adds the animated FloatingPathsBackground as a subtle supporting
 * layer behind all content, a word-staggered headline, and refreshed tokens.
 *
 * Reveal sequence (spring/expo, never bouncy):
 *   1 badge → 2 headline (per-word) → 3 subheadline → 4 CTAs → 5 card → 6 geometry
 *
 * Layout: desktop = split (content left / visual right); tablet + mobile stack
 * with content first and geometry below. Reduced motion → everything static.
 */

const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EXPO } },
};

const headline: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const word: Variants = {
  hidden: { opacity: 0, y: '0.5em' },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EXPO } },
};

// Copy unchanged — only "Overpaying" gets chocolate emphasis.
const HEADLINE_WORDS = [
  { text: 'Stop', accent: false },
  { text: 'Overpaying', accent: true },
  { text: 'for', accent: false },
  { text: 'AI', accent: false },
  { text: 'Tools.', accent: false },
];

export function Hero() {
  const reduce = useReducedMotion();
  // The Sample Audit Result card is hidden on load and revealed only when the
  // user clicks "View Sample Report" — it animates in on top of the geometry.
  const [showSample, setShowSample] = useState(false);
  // initial={false} renders straight at the "visible" state with no enter
  // animation — the reduced-motion path while keeping the same final layout.
  const init = reduce ? false : 'hidden';

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate -mt-16 flex min-h-screen items-center overflow-hidden bg-cream bg-[radial-gradient(125%_125%_at_50%_8%,#FFFDF8_0%,#FAF7F0_46%,#F3EEE4_100%)] pt-16"
    >
      {/* Supporting animated layer — behind all content, never covers text */}
      <FloatingPathsBackground className="z-0" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:gap-10 lg:py-20">
        {/* ── Content (left) ── */}
        <motion.div variants={container} initial={init} animate="visible">
          {/* 1 — Badge */}
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-2 rounded-full border border-sage/70 bg-ivory/70 px-3.5 py-1.5 text-xs font-medium text-bottle backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-sap" aria-hidden="true" />
              Built for Startup Engineering Teams
            </span>
          </motion.div>

          {/* 2 — Headline (per-word stagger) */}
          <motion.h1
            id="hero-heading"
            variants={headline}
            className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-bottle sm:text-5xl lg:text-6xl"
          >
            {HEADLINE_WORDS.map((w) => (
              <motion.span
                key={w.text}
                variants={word}
                className={`mr-[0.28em] inline-block ${w.accent ? 'text-chocolate' : ''}`}
              >
                {w.text}
              </motion.span>
            ))}
          </motion.h1>

          {/* 3 — Subheadline */}
          <motion.p
            variants={item}
            className="mt-5 max-w-xl text-base leading-relaxed text-ink/75 sm:text-lg"
          >
            Audit your AI stack across Claude, Cursor, Copilot, Gemini, ChatGPT
            and OpenAI. Discover hidden waste, optimize plans, and uncover
            savings in minutes.
          </motion.p>

          {/* 4 — CTAs */}
          <motion.div
            variants={item}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Link
              href="/audit"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-bottle px-6 py-3.5 text-sm font-semibold text-cream shadow-[0_10px_30px_-10px_rgba(31,77,54,0.7)] transition-all hover:-translate-y-0.5 hover:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bottle focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              Run Free Audit
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <button
              type="button"
              onClick={() => setShowSample(true)}
              aria-expanded={showSample}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-bottle/30 bg-transparent px-6 py-3.5 text-sm font-semibold text-bottle transition-colors hover:bg-mint/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bottle focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              View Sample Report
            </button>
          </motion.div>

          {/* Trust line */}
          <motion.ul
            variants={item}
            className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink/55"
          >
            {['No login required', 'Results in under 60 seconds', 'Free forever'].map(
              (label) => (
                <li key={label} className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-sap" aria-hidden="true" />
                  {label}
                </li>
              )
            )}
          </motion.ul>
        </motion.div>

        {/* ── Visual (right) ── */}
        <div className="relative min-h-[420px] lg:min-h-[540px]">
          {/* 6 — Geometry (fades in last) */}
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reduce ? { duration: 0 } : { duration: 0.9, delay: 0.95, ease: EXPO }}
            className="absolute inset-0"
          >
            <HeroGeometry reduce={reduce} />
          </motion.div>

          {/* 5 — Sample Audit Result card — hidden until "View Sample Report".
              Animates ON TOP of the geometry (geometry above is untouched). */}
          <AnimatePresence>
            {showSample && (
              <motion.div
                key="sample-card"
                className="absolute inset-0 z-10 flex h-full items-center justify-center px-2"
                style={{ transformPerspective: 1000 }}
                initial={
                  reduce
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.8, y: 30, rotateY: -15 }
                }
                animate={
                  reduce
                    ? { opacity: 1 }
                    : { opacity: 1, scale: 1, y: 0, rotateY: 0 }
                }
                exit={
                  reduce
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.8, y: 30, rotateY: -15 }
                }
                transition={
                  reduce
                    ? { duration: 0.15 }
                    : { type: 'spring', stiffness: 120, damping: 18 }
                }
              >
                <HeroSavingsCard
                  reduce={reduce}
                  onClose={() => setShowSample(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
