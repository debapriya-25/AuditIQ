'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/modals/Modal';
import type { CookiePreferences } from './cookie-preferences';

interface CookiePreferencesModalProps {
  open: boolean;
  onClose: () => void;
  preferences: CookiePreferences | null;
  onSave: (analytics: boolean, performance: boolean) => void;
  onAcceptAll: () => void;
}

function Toggle({
  checked,
  disabled,
  onChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange?: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bottle focus-visible:ring-offset-2 focus-visible:ring-offset-ivory',
        checked ? 'bg-bottle' : 'bg-sage/60',
        disabled && 'cursor-not-allowed opacity-60'
      )}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 transform rounded-full bg-ivory shadow transition-transform',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5'
        )}
      />
    </button>
  );
}

function Row({
  title,
  description,
  badge,
  control,
}: {
  title: string;
  description: string;
  badge?: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-sage/50 bg-cream/50 p-4">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-bottle">{title}</h3>
          {badge && (
            <span className="rounded-full border border-sage/60 bg-mint/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-sap">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-ink/65">{description}</p>
      </div>
      <div className="pt-0.5">{control}</div>
    </div>
  );
}

export function CookiePreferencesModal({
  open,
  onClose,
  preferences,
  onSave,
  onAcceptAll,
}: CookiePreferencesModalProps) {
  const [analytics, setAnalytics] = useState(false);
  const [performance, setPerformance] = useState(false);

  // Sync local toggles to the saved preferences each time the modal opens.
  useEffect(() => {
    if (open) {
      setAnalytics(preferences?.analytics ?? false);
      setPerformance(preferences?.performance ?? false);
    }
  }, [open, preferences]);

  return (
    <Modal open={open} onClose={onClose} title="Cookie Preferences" maxWidthClass="max-w-lg">
      <p className="mb-4 text-sm leading-relaxed text-ink/70">
        AuditIQ currently uses only essential cookies required for functionality.
        The optional categories below are not in use today — set a preference and
        we&apos;ll honor it if we ever introduce them.
      </p>

      <div className="space-y-3">
        <Row
          title="Essential Cookies"
          badge="Always on"
          description="Required for the site to work, including saving your audit draft on your device. These can't be turned off."
          control={<Toggle checked disabled label="Essential cookies (always on)" />}
        />
        <Row
          title="Analytics Cookies"
          badge="Not in use"
          description="Would help us understand anonymous, aggregate usage. None are active today."
          control={
            <Toggle
              checked={analytics}
              onChange={setAnalytics}
              label="Analytics cookies"
            />
          }
        />
        <Row
          title="Performance Cookies"
          badge="Not in use"
          description="Would help us measure and improve load times. None are active today."
          control={
            <Toggle
              checked={performance}
              onChange={setPerformance}
              label="Performance cookies"
            />
          }
        />
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onAcceptAll}
          className="inline-flex items-center justify-center rounded-xl border border-bottle/30 px-5 py-2.5 text-sm font-semibold text-bottle transition-colors hover:bg-mint/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bottle focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
        >
          Accept All
        </button>
        <button
          type="button"
          onClick={() => onSave(analytics, performance)}
          className="inline-flex items-center justify-center rounded-xl bg-bottle px-5 py-2.5 text-sm font-semibold text-cream transition-all hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bottle focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
        >
          Save Preferences
        </button>
      </div>
    </Modal>
  );
}
