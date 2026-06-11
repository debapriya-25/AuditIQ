'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Optional tailwind max-width class for the panel. */
  maxWidthClass?: string;
}

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea,input:not([disabled]),select,[tabindex]:not([tabindex="-1"])';

/**
 * Modal — shared, accessible dialog used by every AuditIQ modal.
 *
 * Accessibility (TASK 9): ESC to close, click-outside to close, focus trap with
 * Tab/Shift+Tab cycling, focus restored to the trigger on close, `role="dialog"`
 * + `aria-modal` + `aria-labelledby`, and body scroll lock while open.
 *
 * Visual: cream/ivory panel, bottle-green accents, backdrop blur, Framer Motion.
 */
export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidthClass = 'max-w-lg',
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => setMounted(true), []);

  const getFocusable = useCallback((): HTMLElement[] => {
    const node = panelRef.current;
    if (!node) return [];
    return Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null
    );
  }, []);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    // Focus the panel so screen readers announce the dialog title.
    const focusTimer = window.setTimeout(() => panelRef.current?.focus(), 0);

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const focusable = getFocusable();
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusable[0]!;
        const last = focusable[focusable.length - 1]!;
        const active = document.activeElement;
        if (e.shiftKey && (active === first || active === panelRef.current)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose, getFocusable]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop — click outside to close */}
          <div
            className="absolute inset-0 bg-bottle/25 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className={cn(
              'relative flex max-h-[85vh] w-full flex-col overflow-hidden rounded-2xl border border-sage/60 bg-ivory shadow-[0_40px_80px_-32px_rgba(31,77,54,0.5)] focus:outline-none',
              maxWidthClass
            )}
          >
            <div className="flex items-start justify-between gap-4 border-b border-sage/40 bg-cream/60 px-6 py-4">
              <h2 id={titleId} className="font-display text-lg font-bold text-bottle">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="-mr-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink/50 transition-colors hover:bg-mint/40 hover:text-bottle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bottle"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div
              data-lenis-prevent
              className="overflow-y-auto px-6 py-5 text-ink"
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
