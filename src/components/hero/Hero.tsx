'use client';

import Link from 'next/link';
import { motion, type Variants } from 'framer-motion';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { HeroBackgroundPaths } from './HeroBackgroundPaths';
import { HeroGeometry } from './HeroGeometry';
import { HeroSavingsCard } from './HeroSavingsCard';

/**
 * Hero — AuditIQ premium hero experience (Phase 6.1).
 *
 * Executive / financial / trustworthy SaaS aesthetic on a warm cream surface.
 * Visual-only: no flows, API contracts, or audit-engine behaviour are touched.
 *
 * Reveal sequence (spring/expo, never bouncy):
 *   1 badge → 2 headline → 3 subheadline → 4 CTAs → 5 savings card → 6 geometry
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

export function Hero() {
  const reduce = useReducedMotion();
  // initial={false} renders straight at the "visible" state with no enter
  // animation — the reduced-motion path while keeping the same final layout.
  const init = reduce ? false : 'hidden';

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate -mt-16 flex min-h-screen items-center overflow-hidden bg-[radial-gradient(125%_125%_at_50%_8%,#FFFDF8_0%,#FAF7F0_46%,#F3EEE4_100%)] pt-16"
    >
      <HeroBackgroundPaths reduce={reduce} className="z-0" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:gap-10 lg:py-20">
        {/* ── Content (left) ── */}
        <motion.div variants={container} initial={init} animate="visible">
          {/* 1 — Badge */}
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-2 rounded-full border border-sage/70 bg-ivory/70 px-3.5 py-1.5 text-xs font-medium text-bottle-green backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-sap-green" aria-hidden="true" />
              Built for Startup Engineering Teams
            </span>
          </motion.div>

          {/* 2 — Headline */}
          <motion.h1
            id="hero-heading"
            variants={item}
            className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-bottle-green sm:text-5xl lg:text-6xl"
          >
            Stop <span className="text-chocolate">Overpaying</span> for AI Tools.
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
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-bottle-green px-6 py-3.5 text-sm font-semibold text-cream shadow-[0_10px_30px_-10px_rgba(31,77,54,0.7)] transition-all hover:-translate-y-0.5 hover:bg-[#173d2a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bottle-green focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              Run Free Audit
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <a
              href="#sample-report"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-bottle-green/30 bg-transparent px-6 py-3.5 text-sm font-semibold text-bottle-green transition-colors hover:bg-mint/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bottle-green focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              View Sample Report
            </a>
          </motion.div>

          {/* Trust line */}
          <motion.ul
            variants={item}
            className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink/55"
          >
            {['No login required', 'Results in under 60 seconds', 'Free forever'].map(
              (label) => (
                <li key={label} className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-sap-green" aria-hidden="true" />
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

          {/* 5 — Savings card */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={
              reduce ? { duration: 0 } : { duration: 0.7, delay: 0.7, ease: EXPO }
            }
            className="pointer-events-none relative z-10 flex h-full items-center justify-center"
          >
            <HeroSavingsCard reduce={reduce} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
