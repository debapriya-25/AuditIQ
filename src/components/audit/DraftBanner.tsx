'use client';

import { motion } from 'framer-motion';
import { RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DraftBannerProps {
  onStartFresh: () => void;
  onDismiss: () => void;
  reduce: boolean;
  className?: string;
}

/**
 * DraftBanner — dismissible notice shown when a previous draft was restored
 * from localStorage. Offers a "Start Fresh" action to wipe and reset.
 */
export function DraftBanner({
  onStartFresh,
  onDismiss,
  reduce,
  className,
}: DraftBannerProps) {
  return (
    <motion.div
      role="status"
      initial={reduce ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-sap/30 bg-mint/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <p className="text-sm text-bottle">
        We restored your previous audit draft.
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onStartFresh}
          className="inline-flex items-center gap-1.5 rounded-lg border border-bottle/30 bg-ivory/70 px-3 py-1.5 text-xs font-semibold text-bottle transition-colors hover:bg-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bottle focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Start Fresh
        </button>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss restored draft notice"
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-bottle/70 transition-colors hover:bg-ivory/70 hover:text-bottle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bottle focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </motion.div>
  );
}
