'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Cookie } from 'lucide-react';
import { usePrivacyUI } from './PrivacyUIProvider';

/**
 * CookieBanner — first-visit consent strip, bottom-center. Truthfully states
 * that AuditIQ uses only essential cookies (verified: no analytics/performance
 * cookies are set). Hidden once a choice is stored in localStorage.
 */
export function CookieBanner() {
  const { cookie, openCookiePreferences } = usePrivacyUI();

  const visible = cookie.hydrated && !cookie.hasConsented;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="region"
          aria-label="Cookie consent"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ type: 'spring', stiffness: 220, damping: 26 }}
          className="fixed inset-x-0 bottom-0 z-[90] flex justify-center px-4 pb-4 sm:pb-6"
        >
          <div className="pointer-events-auto w-full max-w-2xl rounded-2xl border border-sage/60 bg-cream/95 p-5 shadow-[0_24px_60px_-24px_rgba(31,77,54,0.45)] backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sage/60 bg-mint/40 text-bottle">
                <Cookie className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-sm font-bold text-bottle">
                  We respect your privacy
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-ink/70">
                  AuditIQ currently uses only essential cookies required for
                  functionality. We don&apos;t use analytics or advertising
                  cookies.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={openCookiePreferences}
                className="order-3 inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-bottle transition-colors hover:bg-mint/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bottle focus-visible:ring-offset-2 focus-visible:ring-offset-cream sm:order-1"
              >
                Manage Preferences
              </button>
              <button
                type="button"
                onClick={cookie.rejectNonEssential}
                className="order-2 inline-flex items-center justify-center rounded-xl border border-bottle/30 px-4 py-2.5 text-sm font-semibold text-bottle transition-colors hover:bg-ivory focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bottle focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
              >
                Reject Non-Essential
              </button>
              <button
                type="button"
                onClick={cookie.acceptAll}
                className="order-1 inline-flex items-center justify-center rounded-xl bg-bottle px-4 py-2.5 text-sm font-semibold text-cream shadow-[0_10px_30px_-12px_rgba(31,77,54,0.7)] transition-all hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bottle focus-visible:ring-offset-2 focus-visible:ring-offset-cream sm:order-3"
              >
                Accept All
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
