'use client';

import {
  ListChecks,
  SlidersHorizontal,
  ScanSearch,
  Sparkles,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import { Modal } from './Modal';

interface Step {
  n: number;
  Icon: LucideIcon;
  title: string;
  body?: string;
  items?: string[];
}

const STEPS: Step[] = [
  {
    n: 1,
    Icon: ListChecks,
    title: 'Enter your AI tools',
    body: 'Add the tools your team pays for.',
    items: ['Claude', 'Cursor', 'ChatGPT', 'Gemini', 'Copilot', 'OpenAI API'],
  },
  {
    n: 2,
    Icon: SlidersHorizontal,
    title: 'Provide the details',
    items: ['Team size', 'Plans', 'Seats', 'Monthly spend'],
  },
  {
    n: 3,
    Icon: ScanSearch,
    title: 'AuditIQ analyzes',
    items: [
      'Unused seats',
      'Over-provisioned plans',
      'Billing inefficiencies',
      'Annual vs monthly savings',
      'Tool overlap',
    ],
  },
  {
    n: 4,
    Icon: Sparkles,
    title: 'Receive your results',
    items: [
      'Cost recommendations',
      'Savings opportunities',
      'AI-generated explanation',
    ],
  },
  {
    n: 5,
    Icon: CheckCircle2,
    title: 'Review and optimize',
    body: 'Apply the recommendations and re-audit as your team grows.',
  },
];

export function HowItWorksModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="How AuditIQ Works" maxWidthClass="max-w-xl">
      <ol className="space-y-5">
        {STEPS.map(({ n, Icon, title, body, items }) => (
          <li key={n} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sage/60 bg-mint/40 text-bottle">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              {n < STEPS.length && (
                <span className="mt-1 w-px flex-1 bg-sage/50" aria-hidden="true" />
              )}
            </div>
            <div className="pb-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sap">
                  Step {n}
                </span>
              </div>
              <h3 className="mt-0.5 font-display text-base font-semibold text-bottle">
                {title}
              </h3>
              {body && (
                <p className="mt-1 text-sm leading-relaxed text-ink/70">{body}</p>
              )}
              {items && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {items.map((item) => (
                    <span
                      key={item}
                      className="rounded-md border border-sage/50 bg-cream px-2 py-0.5 text-xs font-medium text-sap"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </Modal>
  );
}
