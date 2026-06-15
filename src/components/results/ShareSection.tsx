'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * ShareSection — compact share card. Read-only public URL + copy-to-clipboard
 * with a spring copy-success animation. The URL is resolved from the live origin
 * on mount so it works on any deployment host.
 */
export function ShareSection({ slug }: { slug: string }) {
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    setUrl(`${window.location.origin}/results/${slug}`);
  }, [slug]);

  async function handleCopy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked — select the field so the user can copy manually.
      const input = document.getElementById(
        'share-url'
      ) as HTMLInputElement | null;
      input?.select();
    }
  }

  const pop = reduce
    ? {}
    : {
        initial: { opacity: 0, scale: 0.6 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.6 },
        transition: { type: 'spring' as const, stiffness: 500, damping: 24 },
      };

  // Conditional spreads avoid passing `undefined` to motion props (the project
  // uses exactOptionalPropertyTypes).
  const tapProps = reduce ? {} : { whileTap: { scale: 0.95 } };
  const pulseProps =
    !reduce && copied
      ? { animate: { scale: [1, 1.05, 1], transition: { duration: 0.35 } } }
      : {};

  return (
    <section className="rounded-2xl border border-sage/55 bg-ivory/85 p-5 backdrop-blur-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-sage/55 bg-mint/30 text-sap"
          >
            <Share2 className="h-4 w-4" />
          </span>
          <div>
            <div className="text-sm font-semibold text-bottle">Share this audit</div>
            <p className="text-xs text-ink/55">Anyone with the link can view it.</p>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 gap-2 sm:max-w-md">
          <label htmlFor="share-url" className="sr-only">
            Shareable audit URL
          </label>
          <input
            id="share-url"
            type="text"
            readOnly
            value={url}
            className="min-w-0 flex-1 rounded-xl border border-sage/60 bg-cream/70 px-3.5 py-2.5 font-mono text-xs text-ink/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bottle"
          />
          <motion.button
            type="button"
            onClick={handleCopy}
            aria-label="Copy share link to clipboard"
            {...tapProps}
            {...pulseProps}
            className={cn(
              'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bottle focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
              copied ? 'bg-mint/60 text-bottle' : 'bg-bottle text-cream hover:brightness-95'
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span key="copied" {...pop} className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Copied!
                </motion.span>
              ) : (
                <motion.span key="copy" {...pop} className="inline-flex items-center gap-2">
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  Copy link
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </section>
  );
}
