import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { n: 1, label: 'Enter Your Tools' },
  { n: 2, label: 'See Your Audit' },
] as const;

/**
 * ProgressSteps — 2-step indicator for the audit funnel. Step 1 is active on
 * the form page; step 2 is upcoming.
 */
export function ProgressSteps({ current = 1 }: { current?: 1 | 2 }) {
  return (
    <ol className="flex items-center justify-center gap-3 sm:gap-4">
      {STEPS.map((step, i) => {
        const isActive = step.n === current;
        const isDone = step.n < current;
        return (
          <li key={step.n} className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
                  isActive && 'border-bottle bg-bottle text-cream',
                  isDone && 'border-sap bg-sap text-cream',
                  !isActive && !isDone && 'border-sage/70 bg-ivory text-ink/50'
                )}
                aria-hidden="true"
              >
                {isDone ? <Check className="h-3.5 w-3.5" /> : step.n}
              </span>
              <span
                className={cn(
                  'text-sm font-medium',
                  isActive ? 'text-bottle' : 'text-ink/55'
                )}
              >
                <span className="sr-only">
                  {isActive ? 'Current step: ' : ''}
                </span>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                className="hidden h-px w-8 bg-sage/60 sm:block sm:w-12"
                aria-hidden="true"
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
