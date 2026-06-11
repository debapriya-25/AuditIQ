'use client';
import { usePathname } from 'next/navigation';
import { usePrivacyUI } from '../privacy/PrivacyUIProvider';

export function Footer() {
  const pathname = usePathname();
  const { openPrivacy, openHowItWorks, openCookiePreferences } = usePrivacyUI();

  // The audit form is a focused, distraction-free funnel step — no footer.
  if (pathname === '/audit') return null;

  return (
    <footer className="w-full py-8 mt-auto border-t border-sage/40 bg-cream">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-ink/70 text-body-sm">
          <span className="font-display font-semibold text-bottle">AuditIQ</span>
          {' · '}Optimize AI Costs. Keep Performance.
        </p>
        <div className="flex items-center gap-6 text-ink/70 text-body-sm">
          <button
            type="button"
            onClick={openPrivacy}
            className="hover:text-bottle transition-colors focus-visible:outline-none focus-visible:underline"
          >
            Privacy
          </button>
          <button
            type="button"
            onClick={openHowItWorks}
            className="hover:text-bottle transition-colors focus-visible:outline-none focus-visible:underline"
          >
            How it works
          </button>
          <button
            type="button"
            onClick={openCookiePreferences}
            className="hover:text-bottle transition-colors focus-visible:outline-none focus-visible:underline"
          >
            Cookie preferences
          </button>
        </div>
      </div>
    </footer>
  );
}
