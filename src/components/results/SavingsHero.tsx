'use client';

import { motion } from 'framer-motion';
import { Sparkles, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';

const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

function formatUSD(value: number): string {
  return `$${Math.round(value).toLocaleString('en-US')}`;
}

interface SavingsHeroProps {
  /** Total current spend across all audited tools. */
  monthlySpend: number;
  annualSpend: number;
  /** Potential savings the audit identified. */
  savingsMonthly: number;
  savingsAnnual: number;
  toolCount: number;
  useCaseLabel: string;
  teamSize: number;
}

interface MetricProps {
  label: string;
  value: number;
  suffix: string;
  delay: number;
  sub?: string;
  emphasis?: boolean;
}

/** One headline figure with an animated counter. */
function Metric({ label, value, suffix, delay, sub, emphasis = false }: MetricProps) {
  return (
    <div className="px-0 py-1 sm:px-6 sm:first:pl-0 sm:last:pr-0">
      <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-ink/55">
        {label}
      </div>
      <div
        className={cn(
          'mt-2 font-display font-bold leading-none tabular-nums',
          emphasis
            ? 'text-4xl text-bottle sm:text-[2.75rem]'
            : 'text-3xl text-bottle/85 sm:text-[2.1rem]'
        )}
      >
        <AnimatedNumber value={value} delay={delay} />
        <span className="ml-1 text-base font-semibold text-ink/40">{suffix}</span>
      </div>
      {sub && (
        <div
          className={cn(
            'mt-2 font-mono text-xs font-semibold',
            emphasis ? 'text-sap' : 'text-ink/45'
          )}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

/**
 * SavingsHero — headline insight panel. Shows the team's current monthly and
 * annual spend alongside the audit's potential savings, each with an animated
 * counter. No false savings are ever manufactured: when nothing can be saved the
 * savings figure simply animates to $0 with an "already optimized" affirmation.
 */
export function SavingsHero({
  monthlySpend,
  annualSpend,
  savingsMonthly,
  savingsAnnual,
  toolCount,
  useCaseLabel,
  teamSize,
}: SavingsHeroProps) {
  const reduce = useReducedMotion();
  const hasSavings = savingsMonthly > 0;
  const toolsLabel = `${toolCount} ${toolCount === 1 ? 'tool' : 'tools'}`;

  const reveal = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, ease: EXPO },
      };

  return (
    <motion.section
      {...reveal}
      className="overflow-hidden rounded-3xl border border-sage/55 bg-ivory/90 p-8 shadow-[0_30px_70px_-40px_rgba(31,77,54,0.4)] backdrop-blur-sm sm:p-10"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-sap">
          Your AI Spend Audit
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold',
            hasSavings
              ? 'border-sap/30 bg-mint/40 text-bottle'
              : 'border-sap/30 bg-mint/30 text-sap'
          )}
        >
          {hasSavings ? (
            <>
              <TrendingDown className="h-3.5 w-3.5" aria-hidden="true" />
              Savings identified
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Already optimized
            </>
          )}
        </span>
      </div>

      <div className="mt-8 grid grid-cols-1 divide-y divide-sage/40 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <Metric
          label="Monthly Spend"
          value={monthlySpend}
          suffix="/mo"
          delay={0.3}
        />
        <Metric
          label="Annual Spend"
          value={annualSpend}
          suffix="/yr"
          delay={0.45}
        />
        <Metric
          label="Potential Savings"
          value={savingsMonthly}
          suffix="/mo"
          delay={0.6}
          emphasis
          sub={
            hasSavings
              ? `${formatUSD(savingsAnnual)} per year`
              : 'No waste found — nice work'
          }
        />
      </div>

      <p className="mt-8 border-t border-sage/40 pt-5 text-xs uppercase tracking-[0.08em] text-ink/50">
        Based on {toolsLabel} · {useCaseLabel} team of {teamSize}
      </p>
    </motion.section>
  );
}
