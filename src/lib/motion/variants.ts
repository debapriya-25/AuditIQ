import type { Variants, Transition } from 'framer-motion';

/* ──────────────────────────────────────────────────────
   Easing Curves
   ────────────────────────────────────────────────────── */

export const easing = {
  /** Expo-out — the signature AuditIQ feel */
  expoOut: [0.16, 1, 0.3, 1] as [number, number, number, number],
  /** Smooth spring-like deceleration */
  smooth: [0.22, 1, 0.36, 1] as [number, number, number, number],
  /** Gentle cubic for subtle motions */
  gentle: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

/* ──────────────────────────────────────────────────────
   Transition Presets
   ────────────────────────────────────────────────────── */

export const transitions = {
  spring: { type: 'spring', stiffness: 200, damping: 25 } as Transition,
  springBouncy: { type: 'spring', stiffness: 300, damping: 20 } as Transition,
  smooth: { duration: 0.5, ease: easing.expoOut } as Transition,
  fast: { duration: 0.25, ease: easing.smooth } as Transition,
  slow: { duration: 0.8, ease: easing.expoOut } as Transition,
};

/* ──────────────────────────────────────────────────────
   Entry Variants
   ────────────────────────────────────────────────────── */

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: easing.expoOut },
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easing.expoOut },
  },
};

export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.92, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: easing.expoOut },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: easing.expoOut },
  },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: easing.expoOut },
  },
};

/* ──────────────────────────────────────────────────────
   Stagger Containers
   ────────────────────────────────────────────────────── */

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export const staggerContainerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

/* ──────────────────────────────────────────────────────
   Card / Item Variants
   ────────────────────────────────────────────────────── */

export const cardReveal: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: easing.expoOut },
  },
};

/* ──────────────────────────────────────────────────────
   Interaction Variants
   ────────────────────────────────────────────────────── */

export const glowPulse: Variants = {
  idle: {
    boxShadow: '0 0 0px rgba(59,130,246,0)',
  },
  hover: {
    boxShadow:
      '0 0 24px rgba(59,130,246,0.35), 0 0 60px rgba(59,130,246,0.12)',
    transition: { duration: 0.3 },
  },
};

export const scalePress: Variants = {
  tap: { scale: 0.97, transition: { duration: 0.1 } },
};

export const hoverLift: Variants = {
  rest: { y: 0, scale: 1 },
  hover: {
    y: -4,
    scale: 1.02,
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
};

/* ──────────────────────────────────────────────────────
   Page Transitions
   ────────────────────────────────────────────────────── */

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8, filter: 'blur(4px)' },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.35, ease: easing.expoOut },
  },
  exit: {
    opacity: 0,
    y: -8,
    filter: 'blur(2px)',
    transition: { duration: 0.2, ease: easing.gentle },
  },
};

/* ──────────────────────────────────────────────────────
   Modal / Overlay Transitions
   ────────────────────────────────────────────────────── */

export const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export const modalContent: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 5,
    transition: { duration: 0.15 },
  },
};
