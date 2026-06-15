'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

const EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * AISummaryCard — premium insight card for the audit's narrative summary.
 * AI icon badge + a soft mint gradient surface + an in-view reveal. Content is
 * the unchanged summary string passed from the server.
 */
export function AISummaryCard({ summary }: { summary: string }) {
  const reduce = useReducedMotion();

  const reveal = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 24, filter: 'blur(6px)' },
        whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
        viewport: { once: true, margin: '-80px' },
        transition: { duration: 0.6, ease: EXPO },
      };

  return (
    <motion.section
      {...reveal}
      className="relative overflow-hidden rounded-2xl border border-sap/25 bg-gradient-to-br from-mint/30 via-ivory/85 to-ivory/85 p-6 shadow-[0_22px_55px_-38px_rgba(31,77,54,0.45)] backdrop-blur-sm sm:p-7"
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sap/30 bg-mint/50 text-sap"
        >
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-sap">
          AI Summary
        </div>
      </div>

      <p className="mt-4 text-base font-light leading-relaxed text-ink/80">
        {summary}
      </p>
    </motion.section>
  );
}
