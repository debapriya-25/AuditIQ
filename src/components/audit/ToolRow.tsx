'use client';

import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dropdown, type DropdownOption } from './Dropdown';
import {
  TOOLS,
  getTool,
  getPlan,
  seatsApply,
  type PlanOption,
} from './catalog';

export interface ToolRowErrors {
  toolId?: string | undefined;
  plan?: string | undefined;
  seats?: string | undefined;
  monthlySpend?: string | undefined;
}

interface ToolRowProps {
  index: number;
  toolId: string;
  plan: string;
  seats: string;
  monthlySpend: string;
  errors: ToolRowErrors;
  /** Tool ids already chosen in other rows (disabled in this row's selector). */
  takenToolIds: Set<string>;
  showRemove: boolean;
  disabled: boolean;
  reduce: boolean;
  onToolChange: (value: string) => void;
  onPlanChange: (value: string) => void;
  onSeatsChange: (value: string) => void;
  onSpendChange: (value: string) => void;
  onRemove: () => void;
}

function planHint(plan: PlanOption): string {
  if (plan.usageBased) return 'Usage';
  if (plan.custom) return 'Custom';
  if (typeof plan.flatPrice === 'number')
    return plan.flatPrice === 0 ? 'Free' : `$${plan.flatPrice}/mo`;
  if (typeof plan.pricePerSeat === 'number') return `$${plan.pricePerSeat}/seat`;
  return '';
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-ink/55"
    >
      {children}
    </label>
  );
}

function FieldError({ id, message }: { id: string; message?: string | undefined }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-xs font-medium text-chocolate">
      {message}
    </p>
  );
}

export function ToolRow({
  index,
  toolId,
  plan,
  seats,
  monthlySpend,
  errors,
  takenToolIds,
  showRemove,
  disabled,
  reduce,
  onToolChange,
  onPlanChange,
  onSeatsChange,
  onSpendChange,
  onRemove,
}: ToolRowProps) {
  const tool = getTool(toolId);
  const isApi = !!tool?.apiProduct;
  const selectedPlan = getPlan(toolId, plan);
  const showPlan = !!tool && !isApi;
  const showSeats = seatsApply(toolId, plan);
  const showSpend = !!tool && (isApi || !!selectedPlan);

  const base = `tool-${index}`;

  const toolOptions: DropdownOption[] = TOOLS.map((t) => ({
    value: t.id,
    label: t.name,
    disabled: t.id !== toolId && takenToolIds.has(t.id),
    hint: t.id !== toolId && takenToolIds.has(t.id) ? 'Added' : undefined,
  }));

  const planOptions: DropdownOption[] = (tool?.plans ?? []).map((p) => ({
    value: p.value,
    label: p.label,
    hint: planHint(p),
  }));

  return (
    <motion.div
      layout={!reduce}
      initial={reduce ? false : { opacity: 0, y: -8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: -8 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'relative rounded-2xl border border-sage/55 bg-ivory/80 p-5 backdrop-blur-sm transition-shadow hover:shadow-[0_18px_44px_-28px_rgba(31,77,54,0.4)] sm:p-6',
        disabled && 'pointer-events-none opacity-60'
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-sap">
          Tool {index + 1}
        </span>
        {showRemove && (
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove tool ${index + 1}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink/45 transition-colors hover:bg-cream hover:text-chocolate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bottle focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Tool selector */}
        <div>
          <FieldLabel htmlFor={`${base}-tool`}>Tool</FieldLabel>
          <Dropdown
            options={toolOptions}
            value={toolId}
            onChange={onToolChange}
            placeholder="Select a tool"
            ariaLabel={`Tool for row ${index + 1}`}
            searchable
            invalid={!!errors.toolId}
            describedBy={errors.toolId ? `${base}-tool-error` : undefined}
          />
          <FieldError id={`${base}-tool-error`} message={errors.toolId} />
        </div>

        {/* Plan selector */}
        {showPlan && (
          <div>
            <FieldLabel htmlFor={`${base}-plan`}>Plan</FieldLabel>
            <Dropdown
              options={planOptions}
              value={plan}
              onChange={onPlanChange}
              placeholder="Select a plan"
              ariaLabel={`Plan for row ${index + 1}`}
              invalid={!!errors.plan}
              describedBy={errors.plan ? `${base}-plan-error` : undefined}
            />
            <FieldError id={`${base}-plan-error`} message={errors.plan} />
          </div>
        )}

        {/* Seats + Monthly spend */}
        {showSpend && (
          <div
            className={cn(
              'grid gap-4',
              showSeats ? 'sm:grid-cols-2' : 'grid-cols-1'
            )}
          >
            {showSeats && (
              <div>
                <FieldLabel htmlFor={`${base}-seats`}>Seats</FieldLabel>
                <input
                  id={`${base}-seats`}
                  type="number"
                  inputMode="numeric"
                  min={1}
                  step={1}
                  value={seats}
                  onChange={(e) => onSeatsChange(e.target.value)}
                  placeholder="1"
                  aria-invalid={!!errors.seats || undefined}
                  aria-describedby={
                    errors.seats ? `${base}-seats-error` : undefined
                  }
                  className={cn(
                    'w-full rounded-xl border bg-ivory px-4 py-3 text-sm text-ink transition-colors placeholder:text-ink/40',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bottle focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
                    errors.seats
                      ? 'border-chocolate/60'
                      : 'border-sage/60 hover:border-sap/70'
                  )}
                />
                <FieldError id={`${base}-seats-error`} message={errors.seats} />
              </div>
            )}

            <div>
              <FieldLabel htmlFor={`${base}-spend`}>Monthly Spend</FieldLabel>
              <div className="relative">
                <span
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-ink/50"
                  aria-hidden="true"
                >
                  $
                </span>
                <input
                  id={`${base}-spend`}
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  value={monthlySpend}
                  onChange={(e) => onSpendChange(e.target.value)}
                  placeholder="Your avg. monthly bill"
                  aria-invalid={!!errors.monthlySpend || undefined}
                  aria-describedby={
                    errors.monthlySpend ? `${base}-spend-error` : undefined
                  }
                  className={cn(
                    'w-full rounded-xl border bg-ivory py-3 pl-8 pr-4 text-sm text-ink transition-colors placeholder:text-ink/40',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bottle focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
                    errors.monthlySpend
                      ? 'border-chocolate/60'
                      : 'border-sage/60 hover:border-sap/70'
                  )}
                />
              </div>
              <FieldError
                id={`${base}-spend-error`}
                message={errors.monthlySpend}
              />
              {isApi && !errors.monthlySpend && (
                <p className="mt-1.5 text-xs text-ink/50">
                  Usage-based — enter your average monthly bill.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
