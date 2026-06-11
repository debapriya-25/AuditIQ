import { AnimatedNumber } from '@/components/ui/AnimatedNumber';

function formatUSD(value: number): string {
  return `$${Math.round(value).toLocaleString('en-US')}`;
}

interface SavingsHeroProps {
  monthly: number;
  annual: number;
  toolCount: number;
  useCaseLabel: string;
  teamSize: number;
}

/**
 * SavingsHero — headline savings block. Renders the animated monthly figure
 * (via the AnimatedNumber client island) or an "optimized" message when there
 * is nothing to save. No false savings are ever manufactured.
 */
export function SavingsHero({
  monthly,
  annual,
  toolCount,
  useCaseLabel,
  teamSize,
}: SavingsHeroProps) {
  const hasSavings = monthly > 0;
  const toolsLabel = `${toolCount} ${toolCount === 1 ? 'tool' : 'tools'}`;

  return (
    <section className="overflow-hidden rounded-3xl border border-sage/55 bg-ivory/90 p-8 shadow-[0_30px_70px_-40px_rgba(31,77,54,0.4)] backdrop-blur-sm sm:p-10">
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-sap">
        Your AI Spend Audit
      </span>

      {hasSavings ? (
        <div className="mt-4">
          <p className="text-base text-ink/65">You could save</p>
          <div className="mt-1 font-display text-5xl font-bold leading-none text-bottle sm:text-6xl">
            <AnimatedNumber value={monthly} />
            <span className="ml-2 text-2xl font-semibold text-ink/55 sm:text-3xl">
              /month
            </span>
          </div>
          <p className="mt-3 font-mono text-base font-semibold text-sap">
            That&apos;s {formatUSD(annual)} per year
          </p>
        </div>
      ) : (
        <div className="mt-4">
          <p className="font-display text-4xl font-bold leading-tight text-bottle sm:text-5xl">
            Your AI spend looks optimized.
          </p>
          <p className="mt-3 text-base text-ink/65">
            No meaningful savings found — your team is on the right plans.
          </p>
        </div>
      )}

      <p className="mt-6 text-xs uppercase tracking-[0.08em] text-ink/50">
        Based on {toolsLabel} · {useCaseLabel} team of {teamSize}
      </p>
    </section>
  );
}
