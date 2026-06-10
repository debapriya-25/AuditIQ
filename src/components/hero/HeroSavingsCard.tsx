'use client';

import { useEffect } from 'react';
import {
  motion,
  animate,
  useMotionValue,
  useTransform,
} from 'framer-motion';
import { ArrowDownRight, TrendingDown } from 'lucide-react';

/**
 * HeroSavingsCard — the hero-side savings visualization (Phase 6.1).
 *
 * Communicates the single most important promise immediately: "AuditIQ finds
 * savings." Shows the annual headline, a current → optimized monthly delta,
 * and a reduction bar. Numbers count up on mount (instant for reduced motion).
 *
 * Purely illustrative sample figures — no backend/engine data is involved.
 */

const CURRENT_MONTHLY = 1240;
const OPTIMIZED_MONTHLY = 720;
const ANNUAL_SAVINGS = (CURRENT_MONTHLY - OPTIMIZED_MONTHLY) * 12; // 6,240
const REDUCTION_PCT = Math.round(
  (1 - OPTIMIZED_MONTHLY / CURRENT_MONTHLY) * 100
); // 42

function Money({
  value,
  delay = 0,
  reduce,
}: {
  value: number;
  delay?: number;
  reduce: boolean;
}) {
  const mv = useMotionValue(reduce ? value : 0);
  const text = useTransform(
    mv,
    (v) => `$${Math.round(v).toLocaleString('en-US')}`
  );

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, {
      duration: 1.4,
      delay,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [value, delay, reduce, mv]);

  return <motion.span>{text}</motion.span>;
}

export function HeroSavingsCard({ reduce = false }: { reduce?: boolean }) {
  return (
    <div
      id="sample-report"
      className="pointer-events-auto w-full max-w-sm scroll-mt-28 rounded-2xl border border-sage/60 bg-ivory/90 p-6 shadow-[0_24px_60px_-24px_rgba(31,77,54,0.35)] backdrop-blur-sm sm:p-7"
    >
      {/* Label */}
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.14em] text-sap-green">
        <TrendingDown className="h-4 w-4" aria-hidden="true" />
        Potential Savings
      </div>

      {/* Annual headline */}
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="font-display text-5xl font-bold leading-none text-chocolate sm:text-6xl">
          <Money value={ANNUAL_SAVINGS} delay={0.1} reduce={reduce} />
        </span>
        <span className="text-base font-medium text-ink/60">/year</span>
      </div>

      {/* Current → optimized */}
      <div className="mt-6 flex items-center gap-3">
        <div className="flex-1 rounded-xl border border-ink/10 bg-cream/70 px-4 py-3">
          <div className="text-[11px] uppercase tracking-wide text-ink/50">
            Current
          </div>
          <div className="mt-0.5 font-mono text-lg font-medium text-ink/70 line-through decoration-ink/30">
            <Money value={CURRENT_MONTHLY} delay={0.15} reduce={reduce} />
            <span className="ml-0.5 text-xs no-underline">/mo</span>
          </div>
        </div>

        <ArrowDownRight
          className="h-5 w-5 shrink-0 text-sap-green"
          aria-hidden="true"
        />

        <div className="flex-1 rounded-xl border border-sap-green/30 bg-mint/40 px-4 py-3">
          <div className="text-[11px] uppercase tracking-wide text-bottle-green/70">
            Optimized
          </div>
          <div className="mt-0.5 font-mono text-lg font-bold text-bottle-green">
            <Money value={OPTIMIZED_MONTHLY} delay={0.25} reduce={reduce} />
            <span className="ml-0.5 text-xs">/mo</span>
          </div>
        </div>
      </div>

      {/* Reduction bar */}
      <div className="mt-6">
        <div className="mb-1.5 flex items-center justify-between text-xs text-ink/55">
          <span>Spend reduced</span>
          <span className="font-semibold text-chocolate">
            −{REDUCTION_PCT}%
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-cream">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-bottle-green to-sap-green"
            initial={reduce ? false : { width: '100%' }}
            animate={{ width: `${100 - REDUCTION_PCT}%` }}
            transition={
              reduce ? { duration: 0 } : { duration: 1.1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }
            }
          />
        </div>
        <p className="mt-4 text-xs leading-relaxed text-ink/55">
          Based on a typical 8-seat startup stack across Claude, Cursor &amp;
          Copilot.
        </p>
      </div>
    </div>
  );
}
