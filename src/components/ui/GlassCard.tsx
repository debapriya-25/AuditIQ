import { cn } from '@/lib/utils';
import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'sunken';
}

const variants = {
  default:  'bg-[rgba(20,27,45,0.65)] border border-[rgba(120,160,255,0.12)]',
  elevated: 'bg-[rgba(28,37,64,0.75)] border border-[rgba(120,160,255,0.20)] shadow-glass-elevated',
  sunken:   'bg-[rgba(8,12,20,0.80)] border border-[rgba(120,160,255,0.08)]',
};

export function GlassCard({ children, className, variant = 'default', ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-[var(--radius-card)] backdrop-blur-[var(--glass-blur)]',
        variants[variant],
        className
      )}
      {...props}
    >
      {/* Top edge highlight — simulates light hitting the top of the glass */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-[var(--radius-card)]" />
      {children}
    </div>
  );
}
