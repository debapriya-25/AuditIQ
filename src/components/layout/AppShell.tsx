'use client';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AmbientBackground } from './AmbientBackground';
import { PageTransitionLayer } from './PageTransitionLayer';
import { NoiseOverlay } from '../ui/NoiseOverlay';
import { AuroraBackground } from '../ui/AuroraBackground';

/**
 * AppShell — Modular, decoupled layout shell.
 * Each visual layer is independent and can be swapped per-route.
 *
 * Layer hierarchy (back to front):
 *   Z-30  AuroraBackground (CSS gradient mesh)
 *   Z-10  AmbientBackground (3D scenes, route-specific)
 *   Z+0   Main content
 *   Z+50  NoiseOverlay (film grain)
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col relative bg-cream">
      {/* ── Ambient Layers ── */}
      <AuroraBackground />
      <AmbientBackground />
      <NoiseOverlay />

      {/* ── Navigation ── */}
      <Navbar />

      {/* ── Page Content ── */}
      <main className="flex-1 flex flex-col w-full relative z-10">
        <PageTransitionLayer>
          {children}
        </PageTransitionLayer>
      </main>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}
