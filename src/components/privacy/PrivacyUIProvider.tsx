'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { HowItWorksModal } from '@/components/modals/HowItWorksModal';
import { PrivacyModal } from '@/components/modals/PrivacyModal';
import { CookiePreferencesModal } from './CookiePreferencesModal';
import {
  buildPreferences,
  loadCookiePreferences,
  saveCookiePreferences,
  type CookiePreferences,
} from './cookie-preferences';

interface CookieState {
  hydrated: boolean;
  hasConsented: boolean;
  preferences: CookiePreferences | null;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  savePreferences: (analytics: boolean, performance: boolean) => void;
}

interface PrivacyUIContextValue {
  openHowItWorks: () => void;
  openPrivacy: () => void;
  openCookiePreferences: () => void;
  cookie: CookieState;
}

const PrivacyUIContext = createContext<PrivacyUIContextValue | null>(null);

export function usePrivacyUI(): PrivacyUIContextValue {
  const ctx = useContext(PrivacyUIContext);
  if (!ctx) {
    throw new Error('usePrivacyUI must be used within a PrivacyUIProvider');
  }
  return ctx;
}

/**
 * PrivacyUIProvider — single owner of the How It Works / Privacy / Cookie
 * Preferences modals and the cookie-consent state. Mounts each modal exactly
 * once and exposes openers + cookie actions via context, so the footer and the
 * cookie banner can trigger them without duplicating modal instances.
 */
export function PrivacyUIProvider({ children }: { children: React.ReactNode }) {
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [cookiePrefsOpen, setCookiePrefsOpen] = useState(false);

  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setPreferences(loadCookiePreferences());
    setHydrated(true);
  }, []);

  const persist = useCallback((prefs: CookiePreferences) => {
    saveCookiePreferences(prefs);
    setPreferences(prefs);
  }, []);

  const acceptAll = useCallback(
    () => persist(buildPreferences(true, true)),
    [persist]
  );
  const rejectNonEssential = useCallback(
    () => persist(buildPreferences(false, false)),
    [persist]
  );
  const savePreferences = useCallback(
    (analytics: boolean, performance: boolean) =>
      persist(buildPreferences(analytics, performance)),
    [persist]
  );

  const value = useMemo<PrivacyUIContextValue>(
    () => ({
      openHowItWorks: () => setHowItWorksOpen(true),
      openPrivacy: () => setPrivacyOpen(true),
      openCookiePreferences: () => setCookiePrefsOpen(true),
      cookie: {
        hydrated,
        hasConsented: preferences !== null,
        preferences,
        acceptAll,
        rejectNonEssential,
        savePreferences,
      },
    }),
    [hydrated, preferences, acceptAll, rejectNonEssential, savePreferences]
  );

  return (
    <PrivacyUIContext.Provider value={value}>
      {children}

      <HowItWorksModal
        open={howItWorksOpen}
        onClose={() => setHowItWorksOpen(false)}
      />
      <PrivacyModal open={privacyOpen} onClose={() => setPrivacyOpen(false)} />
      <CookiePreferencesModal
        open={cookiePrefsOpen}
        onClose={() => setCookiePrefsOpen(false)}
        preferences={preferences}
        onSave={(analytics, performance) => {
          savePreferences(analytics, performance);
          setCookiePrefsOpen(false);
        }}
        onAcceptAll={() => {
          acceptAll();
          setCookiePrefsOpen(false);
        }}
      />
    </PrivacyUIContext.Provider>
  );
}
