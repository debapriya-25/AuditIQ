'use client';
import { ThemeProvider } from 'next-themes';
import { ReactQueryProvider } from './query-client';
import { LenisProvider } from './lenis';

/**
 * AppProviders — Unified root provider wrapping the entire app.
 * Order: Theme → Query → Lenis (smooth scroll).
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
      <ReactQueryProvider>
        <LenisProvider>
          {children}
        </LenisProvider>
      </ReactQueryProvider>
    </ThemeProvider>
  );
}
