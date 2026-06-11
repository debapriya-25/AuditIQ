'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean | undefined;
  /** Right-aligned hint, e.g. a price or "Added". */
  hint?: string | undefined;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  searchable?: boolean | undefined;
  invalid?: boolean | undefined;
  describedBy?: string | undefined;
  disabled?: boolean | undefined;
  className?: string | undefined;
}

/**
 * Dropdown — accessible, keyboard-navigable listbox with optional search.
 *
 * Used for both the tool selector (searchable) and the plan selector. Built on
 * native semantics (combobox/listbox/option) rather than a heavy dependency so
 * it stays light and on-brand with the cream/green system.
 */
export function Dropdown({
  options,
  value,
  onChange,
  placeholder,
  ariaLabel,
  searchable = false,
  invalid = false,
  describedBy,
  disabled = false,
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);

  const listboxId = useId();
  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    if (!searchable || query.trim() === '') return options;
    const q = query.trim().toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query, searchable]);

  const firstEnabled = (list: DropdownOption[]): number => {
    const idx = list.findIndex((o) => !o.disabled);
    return idx === -1 ? 0 : idx;
  };

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  // When opening, focus the right element and reset active index to selection.
  useEffect(() => {
    if (!open) return;
    const selectedIdx = filtered.findIndex((o) => o.value === value);
    setActiveIndex(selectedIdx >= 0 ? selectedIdx : firstEnabled(filtered));
    const raf = requestAnimationFrame(() => {
      if (searchable) searchRef.current?.focus();
      else listRef.current?.focus();
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Keep the active option scrolled into view.
  useEffect(() => {
    if (!open) return;
    optionRefs.current[activeIndex]?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  function moveActive(direction: 1 | -1) {
    if (filtered.length === 0) return;
    setActiveIndex((current) => {
      let next = current;
      for (let i = 0; i < filtered.length; i += 1) {
        next = (next + direction + filtered.length) % filtered.length;
        if (!filtered[next]?.disabled) return next;
      }
      return current;
    });
  }

  function commit(index: number) {
    const option = filtered[index];
    if (!option || option.disabled) return;
    onChange(option.value);
    setOpen(false);
    setQuery('');
    triggerRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        moveActive(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        moveActive(-1);
        break;
      case 'Enter':
        e.preventDefault();
        commit(activeIndex);
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        setQuery('');
        triggerRef.current?.focus();
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
        break;
    }
  }

  function onTriggerKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(true);
    }
  }

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        aria-label={ariaLabel}
        data-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onTriggerKeyDown}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-xl border bg-ivory px-4 py-3 text-left text-sm transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bottle focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
          invalid
            ? 'border-chocolate/60'
            : 'border-sage/60 hover:border-sap/70',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        <span className={cn('truncate', selected ? 'text-ink' : 'text-ink/45')}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-sap transition-transform',
            open && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-sage/60 bg-ivory shadow-[0_24px_60px_-24px_rgba(31,77,54,0.45)]">
          {searchable && (
            <div className="flex items-center gap-2 border-b border-sage/40 bg-cream/70 px-3.5 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-sap" aria-hidden="true" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="Search tools…"
                aria-label="Search tools"
                aria-controls={listboxId}
                className="w-full bg-transparent text-sm text-ink placeholder:text-ink/40 focus:outline-none"
              />
            </div>
          )}

          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-label={ariaLabel}
            tabIndex={searchable ? -1 : 0}
            onKeyDown={searchable ? undefined : onKeyDown}
            data-lenis-prevent
            className="max-h-64 overflow-y-auto py-1 focus:outline-none"
          >
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-ink/50">No matches.</li>
            ) : (
              filtered.map((option, index) => {
                const isSelected = option.value === value;
                const isActive = index === activeIndex;
                return (
                  <li
                    key={option.value}
                    ref={(el) => {
                      optionRefs.current[index] = el;
                    }}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled || undefined}
                    onMouseEnter={() => !option.disabled && setActiveIndex(index)}
                    onClick={() => commit(index)}
                    className={cn(
                      'flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors',
                      option.disabled && 'cursor-not-allowed text-ink/30',
                      !option.disabled && isActive && 'bg-mint/50',
                      !option.disabled &&
                        !isActive &&
                        (isSelected ? 'text-bottle' : 'text-ink'),
                      isSelected && 'font-semibold'
                    )}
                  >
                    <span className="flex items-center gap-2 truncate">
                      {isSelected && (
                        <Check
                          className="h-4 w-4 shrink-0 text-sap"
                          aria-hidden="true"
                        />
                      )}
                      <span className="truncate">{option.label}</span>
                    </span>
                    {option.hint && (
                      <span
                        className={cn(
                          'shrink-0 font-mono text-xs',
                          option.disabled ? 'text-ink/30' : 'text-ink/50'
                        )}
                      >
                        {option.hint}
                      </span>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
