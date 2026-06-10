'use client';

import { useEffect } from 'react';
import { motion, animate, useMotionValue, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/**
 * HeroSavingsCard — illustrative "Sample Audit Result" (Phase 6.2).
 *
 * Reframed for product credibility: it must read clearly as an EXAMPLE, not a
 * real customer result. Shows the audited stack (team size + tools), current
 * vs optimized spend, the savings delta, and a public-pricing disclaimer.
 *
 * Figures are illustrative, derived from public list pricing for an 8-engineer
 * team (Claude Team $30, Cursor Pro $20, GitHub Copilot Business $19 → $552/mo;
 * optimized by right-sizing Copilot to Individual and Claude to Pro → $400/mo).
 * No backend / audit-engine data is involved.
 */

const CURRENT_MONTHLY = 552;
const OPTIMIZED_MONTHLY = 400;
const SAVINGS_MONTHLY = CURRENT_MONTHLY - OPTIMIZED_MONTHLY; // 152
const SAVINGS_ANNUAL = SAVINGS_MONTHLY * 12; // 1,824
const REDUCTION_PCT = Math.round(
  (1 - OPTIMIZED_MONTHLY / CURRENT_MONTHLY) * 100
); // 28

const TOOLS = ['Claude Team', 'Cursor Pro', 'GitHub Copilot'];

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
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-semibold text-bottle">
          Sample Audit Result
        </div>
        <span className="rounded-full border border-sage/60 bg-cream px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-sap">
          Illustrative
        </span>
      </div>

      {/* Audited stack context */}
      <div className="mt-4 rounded-xl border border-ink/10 bg-cream/70 px-4 py-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-ink/55">Team Size</span>
          <span className="font-medium text-ink/80">8 Engineers</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {TOOLS.map((tool) => (
            <span
              key={tool}
              className="rounded-md border border-sage/50 bg-ivory px-2 py-0.5 text-[11px] font-medium text-sap"
            >
              {tool}
            </span>
          ))}
        </div>
      </div>

      {/* Current → optimized */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-ink/10 bg-cream/70 px-4 py-3">
          <div className="text-[11px] uppercase tracking-wide text-ink/50">
            Current Spend
          </div>
          <div className="mt-0.5 font-mono text-lg font-medium text-ink/70">
            <Money value={CURRENT_MONTHLY} delay={0.1} reduce={reduce} />
            <span className="ml-0.5 text-xs">/mo</span>
          </div>
        </div>
        <div className="rounded-xl border border-sap/30 bg-mint/40 px-4 py-3">
          <div className="text-[11px] uppercase tracking-wide text-bottle/70">
            Optimized Spend
          </div>
          <div className="mt-0.5 font-mono text-lg font-bold text-bottle">
            <Money value={OPTIMIZED_MONTHLY} delay={0.2} reduce={reduce} />
            <span className="ml-0.5 text-xs">/mo</span>
          </div>
        </div>
      </div>

      {/* Savings delta */}
      <div className="mt-4 flex items-end justify-between rounded-xl border border-chocolate/20 bg-cream px-4 py-3">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-ink/55">
            Savings Delta
          </div>
          <div className="mt-0.5 font-display text-3xl font-bold leading-none text-chocolate">
            <Money value={SAVINGS_MONTHLY} delay={0.3} reduce={reduce} />
            <span className="ml-1 text-sm font-medium text-ink/55">/mo</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-sm font-semibold text-sap">
            ~${SAVINGS_ANNUAL.toLocaleString('en-US')}/yr
          </div>
          <div className="mt-0.5 text-xs font-semibold text-chocolate">
            −{REDUCTION_PCT}%
          </div>
        </div>
      </div>

      {/* Reduction bar */}
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-cream">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-bottle to-sap"
          initial={reduce ? false : { width: '100%' }}
          animate={{ width: `${100 - REDUCTION_PCT}%` }}
          transition={
            reduce
              ? { duration: 0 }
              : { duration: 1.1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }
          }
        />
      </div>

      {/* Disclaimer footer */}
      <div className="mt-4 flex items-center gap-1.5 text-xs text-ink/55">
        <ArrowRight className="h-3.5 w-3.5 text-sap" aria-hidden="true" />
        Example audit based on public pricing data.
      </div>
    </div>
  );
}
