import { cn } from '@/lib/utils';
import type { AuditStatus, ToolAuditFindings } from '@/lib/audit/types';
import { getTool } from '@/components/audit/catalog';
import { StatusBadge } from './StatusBadge';

function formatUSD(value: number): string {
  return `$${Math.round(value).toLocaleString('en-US')}`;
}

const BORDER_BY_STATUS: Record<AuditStatus, string> = {
  optimal: 'border-l-sap',
  overspending: 'border-l-chocolate/70',
  switch_recommended: 'border-l-chocolate',
};

/** One audited tool — current spend, recommendation, reason, and savings. */
export function ToolResultCard({ finding }: { finding: ToolAuditFindings }) {
  const name = getTool(finding.toolId)?.name ?? finding.toolId;
  const current = Number(finding.savings.currentMonthlySpend);
  const savings = Number(finding.savings.savingsPerMonth);
  const hasSavings = Number.isFinite(savings) && savings > 0;

  return (
    <div
      className={cn(
        'rounded-2xl border border-sage/55 border-l-4 bg-ivory/85 p-5 backdrop-blur-sm sm:p-6',
        BORDER_BY_STATUS[finding.status]
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-xl font-semibold text-bottle">{name}</h3>
        <StatusBadge status={finding.status} />
      </div>

      <p className="mt-3 text-sm text-ink/70">
        Currently paying{' '}
        <span className="font-mono font-semibold text-ink">
          {formatUSD(current)}
        </span>
        <span className="text-ink/55">/mo</span>
      </p>

      <div className="mt-4 border-t border-sage/40 pt-4">
        <p className="text-sm leading-relaxed text-ink/80">
          {finding.recommendation.recommendedAction}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-ink/55">
          {finding.recommendation.reason}
        </p>
      </div>

      {hasSavings && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-sap/30 bg-mint/40 px-4 py-1.5">
          <span className="font-mono text-sm font-semibold text-bottle">
            Save {formatUSD(savings)}/mo
          </span>
          <span className="text-xs font-medium text-sap">
            → {formatUSD(savings * 12)}/yr
          </span>
        </div>
      )}
    </div>
  );
}
