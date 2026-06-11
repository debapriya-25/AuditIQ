import { TrendingUp } from 'lucide-react';

function formatUSD(value: number): string {
  return `$${Math.round(value).toLocaleString('en-US')}`;
}

interface TotalsProps {
  monthly: number;
}

/**
 * RunningTotalCard — desktop sticky side panel. Shows the live monthly and
 * annual spend totals. Updates instantly (no animation) per spec.
 */
export function RunningTotalCard({ monthly }: TotalsProps) {
  const annual = monthly * 12;
  return (
    <div className="sticky top-24 rounded-2xl border border-sage/60 bg-ivory/90 p-6 shadow-[0_24px_60px_-30px_rgba(31,77,54,0.35)] backdrop-blur-sm">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-sap">
        <TrendingUp className="h-4 w-4" aria-hidden="true" />
        Running Total
      </div>

      <dl className="mt-5 space-y-5">
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-ink/50">
            Current Monthly Spend
          </dt>
          <dd
            className="mt-1 font-display text-3xl font-bold leading-none text-bottle tabular-nums"
            aria-live="polite"
          >
            {formatUSD(monthly)}
            <span className="ml-1 text-sm font-medium text-ink/55">/mo</span>
          </dd>
        </div>

        <div className="border-t border-sage/40 pt-4">
          <dt className="text-[11px] uppercase tracking-wide text-ink/50">
            Current Annual Spend
          </dt>
          <dd className="mt-1 font-mono text-lg font-semibold text-sap tabular-nums">
            {formatUSD(annual)}
            <span className="ml-1 text-xs font-medium text-ink/45">/yr</span>
          </dd>
        </div>
      </dl>

      <p className="mt-5 text-xs leading-relaxed text-ink/50">
        This is what you pay today. Run the audit to see what you could save.
      </p>
    </div>
  );
}

/**
 * MobileTotalsBar — fixed bottom bar for narrow viewports. Stacks the live
 * totals above a full-width submit button (passed as `children`).
 */
export function MobileTotalsBar({
  monthly,
  children,
}: TotalsProps & { children: React.ReactNode }) {
  const annual = monthly * 12;
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-sage/50 bg-ivory/95 backdrop-blur-md lg:hidden">
      <div className="mx-auto max-w-[720px] space-y-2.5 px-4 pb-3 pt-2.5">
        <div className="flex items-baseline justify-between" aria-live="polite">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[11px] uppercase tracking-wide text-ink/50">
              Monthly
            </span>
            <span className="font-display text-xl font-bold text-bottle tabular-nums">
              {formatUSD(monthly)}
            </span>
          </div>
          <span className="font-mono text-xs text-ink/55 tabular-nums">
            {formatUSD(annual)}/yr
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
