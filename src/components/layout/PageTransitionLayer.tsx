'use client';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

export function PageTransitionLayer({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    // `initial={false}` is critical: the children present on the FIRST mount
    // render directly at their `animate` (visible) state instead of starting at
    // `opacity: 0`. Without it, Framer serializes `opacity: 0` into the SSR HTML
    // and relies on a client-side enter animation to reveal the page — and that
    // enter animation can be dropped by React 18 Strict Mode's dev double-mount,
    // leaving route content invisible until a manual refresh. Subsequent route
    // changes (new `key`) still animate normally.
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
