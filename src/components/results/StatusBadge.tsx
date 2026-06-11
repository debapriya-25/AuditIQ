import { AlertTriangle, ArrowRightLeft, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AuditStatus } from '@/lib/audit/types';

const CONFIG: Record<
  AuditStatus,
  { label: string; Icon: typeof CheckCircle2; className: string }
> = {
  optimal: {
    label: 'Optimal',
    Icon: CheckCircle2,
    className: 'border-sap/30 bg-mint/40 text-bottle',
  },
  overspending: {
    label: 'Overspending',
    Icon: AlertTriangle,
    className: 'border-chocolate/30 bg-chocolate/10 text-chocolate',
  },
  switch_recommended: {
    label: 'Switch Recommended',
    Icon: ArrowRightLeft,
    className: 'border-chocolate/45 bg-chocolate/15 text-chocolate',
  },
};

/** Color + icon + text status badge (color is never the only signal). */
export function StatusBadge({ status }: { status: AuditStatus }) {
  const { label, Icon, className } = CONFIG[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}
