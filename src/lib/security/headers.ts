export function buildCSP(): string {
  const isDev = process.env.NODE_ENV === 'development';

  const directives = {
    'default-src': ["'self'"],
    'script-src': ["'self'", isDev ? "'unsafe-eval'" : '', 'https://plausible.io'],
    'style-src': ["'self'", "'unsafe-inline'", 'https://api.fontshare.com'],
    'font-src': ["'self'", 'https://api.fontshare.com'],
    'img-src': ["'self'", 'data:', 'https:'],
    'connect-src': [
      "'self'",
      'https://*.supabase.co',
      'https://plausible.io',
      'https://api.anthropic.com',
    ],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'upgrade-insecure-requests': [],
  };

  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.filter(Boolean).join(' ')}`.trim())
    .join('; ');
}

export const SECURITY_HEADERS = {
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  // Block clickjacking (iframing our site)
  'X-Frame-Options': 'DENY',
  // Enable XSS filter in legacy browsers
  'X-XSS-Protection': '1; mode=block',
  // Strict HTTPS enforcement (1 year, include subdomains)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  // Control what the browser sends as the Referrer header
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Restrict browser features/APIs
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
};

/**
 * Returns a complete set of security headers including the dynamically built CSP.
 * Designed to be used in Next.js middleware.
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    ...SECURITY_HEADERS,
    'Content-Security-Policy': buildCSP(),
  };
}
