'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FloatingPanelProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function FloatingPanel({ children, className, delay = 0 }: FloatingPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        delay,
      }}
      className={cn(
        'relative rounded-card overflow-hidden',
        'bg-[var(--glass-bg-elevated)] backdrop-blur-[20px]',
        'border border-[var(--glass-border)]',
        'shadow-glass-elevated',
        className
      )}
    >
      {/* Top light edge */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />
      {/* Left accent edge */}
      <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-signal/20 via-violet/10 to-transparent" />
      {children}
    </motion.div>
  );
}
