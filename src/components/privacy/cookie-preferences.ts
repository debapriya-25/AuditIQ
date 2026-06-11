export const COOKIE_PREFS_KEY = 'auditiq_cookie_preferences';

export interface CookiePreferences {
  /** Essential storage is required for the site to function — always on. */
  essential: true;
  analytics: boolean;
  performance: boolean;
  /** ISO timestamp of when the choice was made. */
  decidedAt: string;
}

function isCookiePreferences(value: unknown): value is CookiePreferences {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    v.essential === true &&
    typeof v.analytics === 'boolean' &&
    typeof v.performance === 'boolean' &&
    typeof v.decidedAt === 'string'
  );
}

/** Load saved cookie preferences, or `null` when the user hasn't decided yet. */
export function loadCookiePreferences(): CookiePreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(COOKIE_PREFS_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isCookiePreferences(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveCookiePreferences(prefs: CookiePreferences): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(COOKIE_PREFS_KEY, JSON.stringify(prefs));
  } catch {
    /* private mode / quota — preference simply won't persist */
  }
}

export function buildPreferences(
  analytics: boolean,
  performance: boolean
): CookiePreferences {
  return {
    essential: true,
    analytics,
    performance,
    decidedAt: new Date().toISOString(),
  };
}
