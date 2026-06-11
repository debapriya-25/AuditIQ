'use client';
import { ReactQueryProvider } from './query-client';
import { LenisProvider } from './lenis';

/**
 * AppProviders — root provider wrapper.
 *
 * MVP is a single light cream/green theme. The previous next-themes
 * `forcedTheme="dark"` wrapper has been removed so no `.dark` class is ever
 * applied — this was a source of the brief dark-theme flash on first paint.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <LenisProvider>{children}</LenisProvider>
    </ReactQueryProvider>
  );
}
