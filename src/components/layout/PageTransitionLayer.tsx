'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export function PageTransitionLayer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // ── Hydration / interactivity fix (Phase 6.4D) ──
  // On the server and the FIRST client render we render the route content as
  // plain markup — NOT wrapped in <AnimatePresence> / <motion.div>.
  //
  // Why: this layer wraps the ENTIRE page subtree, so it is a single hydration
  // boundary. When the framer-motion presence wrapper is present during the
  // initial hydration, React Strict Mode's dev double-mount can leave the
  // subtree painted but with its event handlers never finishing attachment —
  // the page is visible but completely inert (geometry, buttons, modals, and
  // the background animation all dead at once). A browser refresh only fixes it
  // intermittently (timing-dependent), and a route change fixes it fully because
  // navigation is a clean client mount with no hydration. `initial={false}`
  // (added earlier) cured the *visibility* symptom but not the *interactivity*
  // one, because the presence wrapper still straddled first hydration.
  //
  // Rendering plain children here lets React hydrate and wire up every handler
  // immediately on first load. After mount we swap in the AnimatePresence
  // wrapper so client-side route transitions still animate. The one-time swap is
  // a clean client mount of the current route (identical to navigating to it),
  // so nothing is ever left inert.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="flex-1 flex flex-col w-full">{children}</div>;
  }

  return (
    // `initial={false}` keeps the route present on this wrapper's first (post-
    // mount) render from replaying the page-level enter animation; subsequent
    // route changes (new `key`) animate normally.
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="flex-1 flex flex-col w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
