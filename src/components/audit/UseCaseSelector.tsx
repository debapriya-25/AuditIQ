'use client';

import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { USE_CASES } from './catalog';

interface UseCaseSelectorProps {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean | undefined;
  describedBy?: string | undefined;
}

/**
 * UseCaseSelector — single-select segmented control implemented as an ARIA
 * radiogroup with full arrow-key navigation. Wraps to multiple rows on narrow
 * viewports per the responsive spec.
 */
export function UseCaseSelector({
  value,
  onChange,
  invalid = false,
  describedBy,
}: UseCaseSelectorProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function focusAndSelect(index: number) {
    const next = (index + USE_CASES.length) % USE_CASES.length;
    const option = USE_CASES[next];
    if (!option) return;
    onChange(option.value);
    refs.current[next]?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent, index: number) {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        focusAndSelect(index + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        focusAndSelect(index - 1);
        break;
      default:
        break;
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label="Primary use case"
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className="flex flex-wrap gap-2"
    >
      {USE_CASES.map((option, index) => {
        const checked = value === option.value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              refs.current[index] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked || (!value && index === 0) ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cn(
              'rounded-xl border px-4 py-2.5 text-sm font-medium transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bottle focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
              checked
                ? 'border-bottle bg-bottle text-cream shadow-[0_8px_20px_-10px_rgba(31,77,54,0.7)]'
                : invalid
                  ? 'border-chocolate/50 bg-ivory text-ink hover:border-sap/60'
                  : 'border-sage/60 bg-ivory text-ink hover:border-sap/70 hover:bg-mint/30'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
