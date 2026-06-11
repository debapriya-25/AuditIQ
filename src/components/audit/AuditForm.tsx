'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { ArrowRight, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  MAX_TOOLS,
  getTool,
  seatsApply,
  suggestedMonthlySpend,
  USAGE_BASED_PLAN,
} from './catalog';
import {
  auditFormSchema,
  defaultFormValues,
  emptyToolRow,
  parseNumber,
  runningMonthlyTotal,
  toSubmitPayload,
  loadDraft,
  saveDraft,
  clearDraft,
  isMeaningfulDraft,
  type AuditFormValues,
} from './form-schema';
import { ProgressSteps } from './ProgressSteps';
import { DraftBanner } from './DraftBanner';
import { UseCaseSelector } from './UseCaseSelector';
import { ToolRow, type ToolRowErrors } from './ToolRow';
import { RunningTotalCard, MobileTotalsBar } from './RunningTotal';

const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

function extractSlug(data: unknown): string | null {
  if (typeof data === 'object' && data !== null && 'publicSlug' in data) {
    const slug = (data as { publicSlug: unknown }).publicSlug;
    if (typeof slug === 'string' && slug.length > 0) return slug;
  }
  return null;
}

function AnalyzingSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Analyzing your stack"
      className="mt-6 rounded-2xl border border-sage/55 bg-ivory/80 p-6"
    >
      <div className="flex items-center gap-2.5 text-sm font-semibold text-bottle">
        <Loader2 className="h-4 w-4 animate-spin text-sap" aria-hidden="true" />
        Analyzing Your Stack…
      </div>
      <div className="mt-5 space-y-3">
        {['w-full', 'w-[88%]', 'w-[62%]'].map((w) => (
          <div
            key={w}
            className={cn('h-3.5 rounded-full bg-sage/30', w, 'animate-pulse')}
          />
        ))}
      </div>
    </div>
  );
}

export function AuditForm() {
  const router = useRouter();
  const reduce = useReducedMotion();

  const form = useForm<AuditFormValues>({
    resolver: zodResolver(auditFormSchema),
    mode: 'onChange',
    defaultValues: defaultFormValues(),
  });
  const { control, register, handleSubmit, setValue, getValues, reset, watch, trigger, formState } =
    form;
  const { fields, append, remove } = useFieldArray({ control, name: 'tools' });

  const [submitting, setSubmitting] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  // Tracks rows where the user manually edited the spend (suppresses auto-fill).
  const spendTouched = useRef<Record<string, boolean>>({});
  const restored = useRef(false);

  // ── Restore a persisted draft on first mount ──
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    const draft = loadDraft();
    if (draft && isMeaningfulDraft(draft)) {
      reset(draft);
      setShowBanner(true);
      void trigger();
    }
  }, [reset, trigger]);

  // ── Persist on every change (skips empty drafts) ──
  useEffect(() => {
    const sub = watch((values) => {
      const v = values as AuditFormValues;
      if (isMeaningfulDraft(v)) saveDraft(v);
      else clearDraft();
    });
    return () => sub.unsubscribe();
  }, [watch]);

  const toolsValues = watch('tools');
  const monthlyTotal = runningMonthlyTotal(toolsValues);

  const selectedToolIds = new Set(
    toolsValues.map((t) => t.toolId).filter((id) => id !== '')
  );

  /* ── Row field orchestration ── */

  const handleToolChange = useCallback(
    (index: number, fieldId: string, value: string) => {
      const tool = getTool(value);
      spendTouched.current[fieldId] = false;
      setValue(`tools.${index}.toolId`, value, {
        shouldValidate: true,
        shouldDirty: true,
      });
      if (tool?.apiProduct) {
        setValue(`tools.${index}.plan`, USAGE_BASED_PLAN, { shouldValidate: true });
        setValue(`tools.${index}.seats`, '1');
        setValue(`tools.${index}.monthlySpend`, '', { shouldValidate: true });
      } else {
        setValue(`tools.${index}.plan`, '', { shouldValidate: true });
        setValue(`tools.${index}.seats`, '');
        setValue(`tools.${index}.monthlySpend`, '', { shouldValidate: true });
      }
    },
    [setValue]
  );

  const handlePlanChange = useCallback(
    (index: number, fieldId: string, value: string) => {
      const toolId = getValues(`tools.${index}.toolId`);
      setValue(`tools.${index}.plan`, value, {
        shouldValidate: true,
        shouldDirty: true,
      });

      const usesSeats = seatsApply(toolId, value);
      if (usesSeats && getValues(`tools.${index}.seats`).trim() === '') {
        setValue(`tools.${index}.seats`, '1');
      }

      const seatsNum = parseNumber(getValues(`tools.${index}.seats`)) ?? 1;
      const suggestion = suggestedMonthlySpend(toolId, value, seatsNum);
      spendTouched.current[fieldId] = false;
      setValue(
        `tools.${index}.monthlySpend`,
        suggestion !== null ? String(suggestion) : '',
        { shouldValidate: true }
      );
    },
    [getValues, setValue]
  );

  const handleSeatsChange = useCallback(
    (index: number, fieldId: string, value: string) => {
      setValue(`tools.${index}.seats`, value, {
        shouldValidate: true,
        shouldDirty: true,
      });
      if (spendTouched.current[fieldId]) return;
      const toolId = getValues(`tools.${index}.toolId`);
      const plan = getValues(`tools.${index}.plan`);
      const seatsNum = parseNumber(value) ?? 1;
      const suggestion = suggestedMonthlySpend(toolId, plan, seatsNum);
      if (suggestion !== null) {
        setValue(`tools.${index}.monthlySpend`, String(suggestion), {
          shouldValidate: true,
        });
      }
    },
    [getValues, setValue]
  );

  const handleSpendChange = useCallback(
    (index: number, fieldId: string, value: string) => {
      spendTouched.current[fieldId] = true;
      setValue(`tools.${index}.monthlySpend`, value, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue]
  );

  function handleAddTool() {
    if (fields.length >= MAX_TOOLS) return;
    append(emptyToolRow());
  }

  function handleRemoveTool(index: number) {
    const fieldId = fields[index]?.id;
    if (fieldId) delete spendTouched.current[fieldId];
    remove(index);
  }

  function handleStartFresh() {
    clearDraft();
    spendTouched.current = {};
    reset(defaultFormValues());
    setShowBanner(false);
  }

  /* ── Submission ── */

  async function onSubmit(values: AuditFormValues) {
    setSubmitting(true);
    try {
      const res = await fetch('/api/audit/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toSubmitPayload(values)),
      });

      if (!res.ok) {
        toast.error(
          res.status === 429
            ? 'Too many submissions. Try again in an hour.'
            : 'Something went wrong saving your audit. Your answers are still here — try again.'
        );
        setSubmitting(false);
        return;
      }

      const slug = extractSlug(await res.json());
      if (!slug) {
        toast.error(
          'Something went wrong saving your audit. Your answers are still here — try again.'
        );
        setSubmitting(false);
        return;
      }

      clearDraft();
      router.push(`/results/${slug}`);
      // Keep `submitting` true through navigation.
    } catch {
      toast.error(
        'Something went wrong saving your audit. Your answers are still here — try again.'
      );
      setSubmitting(false);
    }
  }

  /* ── Error display (gated by dirty state for a calm first impression) ── */

  const { errors, dirtyFields, isValid } = formState;

  const teamSizeError = dirtyFields.teamSize ? errors.teamSize?.message : undefined;
  const useCaseError = dirtyFields.useCase ? errors.useCase?.message : undefined;

  function rowErrors(index: number): ToolRowErrors {
    const e = errors.tools?.[index];
    const d = dirtyFields.tools?.[index];
    if (!e) return {};
    return {
      toolId: d?.toolId ? e.toolId?.message : undefined,
      plan: d?.plan ? e.plan?.message : undefined,
      seats: d?.seats ? e.seats?.message : undefined,
      monthlySpend: d?.monthlySpend ? e.monthlySpend?.message : undefined,
    };
  }

  function submitButton(fullWidth: boolean) {
    const disabled = submitting || !isValid;
    return (
      <button
        type="submit"
        disabled={disabled}
        className={cn(
          'group inline-flex items-center justify-center gap-2 rounded-xl bg-bottle px-6 py-3.5 text-sm font-semibold text-cream transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bottle focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
          fullWidth && 'w-full',
          disabled
            ? 'cursor-not-allowed opacity-50'
            : 'shadow-[0_10px_30px_-10px_rgba(31,77,54,0.7)] hover:-translate-y-0.5 hover:brightness-95'
        )}
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Analyzing Your Stack…
          </>
        ) : (
          <>
            Run My Audit
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </>
        )}
      </button>
    );
  }

  const dimmed = submitting ? 'pointer-events-none select-none opacity-60' : '';

  return (
    <section className="relative isolate -mt-16 min-h-screen overflow-hidden bg-cream bg-[radial-gradient(125%_125%_at_50%_8%,#FFFDF8_0%,#FAF7F0_46%,#F3EEE4_100%)] px-6 pb-44 pt-24 lg:pb-24">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--aiq-ivory)',
            color: 'var(--aiq-bottle-green)',
            border: '1px solid rgba(80,125,79,0.30)',
            borderRadius: '12px',
          },
        }}
      />

      <div className="mx-auto w-full max-w-[1100px]">
        {/* Header */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EXPO }}
          className="mx-auto max-w-[720px] text-center"
        >
          <ProgressSteps current={1} />
          <h1 className="mt-8 font-display text-3xl font-bold tracking-tight text-bottle sm:text-4xl">
            Audit Your AI Stack
          </h1>
          <p className="mt-3 text-base leading-relaxed text-ink/70">
            Add the AI tools your team pays for. We&apos;ll find where you&apos;re
            overspending — no login required.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} aria-busy={submitting} noValidate className="mt-10">
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start lg:gap-10">
            {/* ── Form column ── */}
            <div className="mx-auto w-full max-w-[720px]">
              <AnimatePresence>
                {showBanner && (
                  <DraftBanner
                    key="draft-banner"
                    className="mb-6"
                    reduce={reduce}
                    onStartFresh={handleStartFresh}
                    onDismiss={() => setShowBanner(false)}
                  />
                )}
              </AnimatePresence>

              {/* Global inputs */}
              <div
                className={cn(
                  'rounded-2xl border border-sage/55 bg-ivory/80 p-6 backdrop-blur-sm transition-opacity sm:p-7',
                  dimmed
                )}
              >
                <div>
                  <label
                    htmlFor="teamSize"
                    className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-ink/55"
                  >
                    Team Size
                  </label>
                  <input
                    id="teamSize"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    step={1}
                    placeholder="How many people are on your team?"
                    aria-invalid={!!teamSizeError || undefined}
                    aria-describedby={teamSizeError ? 'teamSize-error' : undefined}
                    {...register('teamSize')}
                    className={cn(
                      'w-full rounded-xl border bg-ivory px-4 py-3 text-sm text-ink transition-colors placeholder:text-ink/40',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bottle focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
                      teamSizeError
                        ? 'border-chocolate/60'
                        : 'border-sage/60 hover:border-sap/70'
                    )}
                  />
                  {teamSizeError && (
                    <p id="teamSize-error" className="mt-1.5 text-xs font-medium text-chocolate">
                      {teamSizeError}
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.08em] text-ink/55">
                    Primary Use Case
                  </span>
                  <UseCaseSelector
                    value={watch('useCase')}
                    onChange={(v) =>
                      setValue('useCase', v, { shouldValidate: true, shouldDirty: true })
                    }
                    invalid={!!useCaseError}
                    describedBy={useCaseError ? 'useCase-error' : undefined}
                  />
                  {useCaseError && (
                    <p id="useCase-error" className="mt-2 text-xs font-medium text-chocolate">
                      {useCaseError}
                    </p>
                  )}
                </div>
              </div>

              {/* Tool rows */}
              <div className={cn('mt-6 space-y-4 transition-opacity', dimmed)}>
                <AnimatePresence initial={false}>
                  {fields.map((field, index) => {
                    const row = toolsValues[index];
                    return (
                      <ToolRow
                        key={field.id}
                        index={index}
                        toolId={row?.toolId ?? ''}
                        plan={row?.plan ?? ''}
                        seats={row?.seats ?? ''}
                        monthlySpend={row?.monthlySpend ?? ''}
                        errors={rowErrors(index)}
                        takenToolIds={selectedToolIds}
                        showRemove={fields.length > 1}
                        disabled={submitting}
                        reduce={reduce}
                        onToolChange={(v) => handleToolChange(index, field.id, v)}
                        onPlanChange={(v) => handlePlanChange(index, field.id, v)}
                        onSeatsChange={(v) => handleSeatsChange(index, field.id, v)}
                        onSpendChange={(v) => handleSpendChange(index, field.id, v)}
                        onRemove={() => handleRemoveTool(index)}
                      />
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Add tool */}
              <button
                type="button"
                onClick={handleAddTool}
                disabled={submitting || fields.length >= MAX_TOOLS}
                className={cn(
                  'mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-sap/50 bg-ivory/50 px-4 py-3.5 text-sm font-semibold text-bottle transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bottle focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
                  submitting || fields.length >= MAX_TOOLS
                    ? 'cursor-not-allowed opacity-50'
                    : 'hover:border-sap hover:bg-mint/30'
                )}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                {fields.length >= MAX_TOOLS
                  ? 'All supported tools added'
                  : 'Add Another Tool'}
              </button>

              {submitting && <AnalyzingSkeleton />}

              {/* Desktop submit */}
              <div className="mt-8 hidden flex-col items-end gap-2 lg:flex">
                {submitButton(false)}
                {!isValid && !submitting && (
                  <p className="text-xs text-ink/50">
                    Complete team size, use case, and each tool to continue.
                  </p>
                )}
              </div>
            </div>

            {/* ── Desktop running total ── */}
            <aside className="hidden lg:block">
              <RunningTotalCard monthly={monthlyTotal} />
            </aside>
          </div>

          {/* ── Mobile sticky total + submit ── */}
          <MobileTotalsBar monthly={monthlyTotal}>{submitButton(true)}</MobileTotalsBar>

          {/* Honeypot — visually hidden, off-screen, not announced */}
          <div aria-hidden="true" className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label htmlFor="website">Leave this field empty</label>
            <input
              id="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              {...register('website')}
            />
          </div>
        </form>
      </div>
    </section>
  );
}
