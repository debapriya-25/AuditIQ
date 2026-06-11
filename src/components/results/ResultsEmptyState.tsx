import Link from 'next/link';
import { ArrowRight, SearchX } from 'lucide-react';

/**
 * ResultsEmptyState — professional "audit not found" surface shown instead of
 * the framework 404 when a slug is unknown, malformed, or unreachable.
 */
export function ResultsEmptyState() {
  return (
    <section className="relative isolate -mt-16 flex min-h-screen items-center justify-center overflow-hidden bg-cream bg-[radial-gradient(125%_125%_at_50%_8%,#FFFDF8_0%,#FAF7F0_46%,#F3EEE4_100%)] px-6 pt-16">
      <div className="w-full max-w-md rounded-2xl border border-sage/55 bg-ivory/85 p-8 text-center backdrop-blur-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-sage/60 bg-cream">
          <SearchX className="h-6 w-6 text-sap" aria-hidden="true" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold text-bottle">
          We couldn&apos;t find this audit
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink/70">
          This audit link may have expired or the address is incorrect. Run a
          fresh audit to see where your team can save.
        </p>
        <Link
          href="/audit"
          className="group mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-bottle px-6 py-3 text-sm font-semibold text-cream shadow-[0_10px_30px_-10px_rgba(31,77,54,0.7)] transition-all hover:-translate-y-0.5 hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bottle focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        >
          Run a new audit
          <ArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
    </section>
  );
}
