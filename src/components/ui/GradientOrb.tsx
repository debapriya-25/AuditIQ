'use client';
import { cn } from '@/lib/utils';

interface GradientOrbProps {
  className?: string;
  color?: 'signal' | 'violet' | 'cyan' | 'emerald' | 'fuchsia';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
}

const colorMap = {
  signal: 'bg-signal/20',
  violet: 'bg-violet/20',
  cyan: 'bg-cyan/20',
  emerald: 'bg-emerald/15',
  fuchsia: 'bg-fuchsia/15',
};

const sizeMap = {
  sm: 'w-32 h-32',
  md: 'w-64 h-64',
  lg: 'w-96 h-96',
  xl: 'w-[500px] h-[500px]',
};

export function GradientOrb({
  className,
  color = 'signal',
  size = 'lg',
  animate = true,
}: GradientOrbProps) {
  return (
    <div
      className={cn(
        'absolute rounded-full blur-[100px] pointer-events-none',
        colorMap[color],
        sizeMap[size],
        animate && 'animate-pulse-glow',
        className
      )}
      aria-hidden="true"
    />
  );
}
