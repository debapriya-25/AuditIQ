'use client';

import { useEffect, useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * ShareSection — read-only public URL + copy-to-clipboard. The URL is resolved
 * from the live origin on mount so it works on any deployment host.
 */
export function ShareSection({ slug }: { slug: string }) {
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);

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

  return (
    <section className="rounded-2xl border border-sage/55 bg-ivory/85 p-6 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-bottle">
        <Share2 className="h-4 w-4 text-sap" aria-hidden="true" />
        Share this audit
      </div>
      <p className="mt-1.5 text-xs text-ink/55">
        Anyone with this link can view your audit results.
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="share-url" className="sr-only">
          Shareable audit URL
        </label>
        <input
          id="share-url"
          type="text"
          readOnly
          value={url}
          className="min-w-0 flex-1 rounded-xl border border-sage/60 bg-cream/70 px-4 py-2.5 font-mono text-xs text-ink/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bottle"
        />
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy share link to clipboard"
          className={cn(
            'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bottle focus-visible:ring-offset-2 focus-visible:ring-offset-cream',
            copied
              ? 'bg-mint/60 text-bottle'
              : 'bg-bottle text-cream hover:brightness-95'
          )}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" aria-hidden="true" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" aria-hidden="true" />
              Copy link
            </>
          )}
        </button>
      </div>
    </section>
  );
}
