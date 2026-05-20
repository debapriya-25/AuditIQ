'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { glowPulse, hoverLift } from '@/lib/motion/variants';

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'signal' | 'emerald' | 'violet' | 'cyan';
}

const glowColors = {
  signal: 'hover:shadow-glow-signal',
  emerald: 'hover:shadow-glow-emerald',
  violet: 'hover:shadow-glow-violet',
  cyan: 'hover:shadow-glow-cyan',
};

const borderGradients = {
  signal: 'from-signal/30 via-violet/20 to-cyan/10',
  emerald: 'from-emerald/30 via-signal/15 to-transparent',
  violet: 'from-violet/30 via-fuchsia/20 to-signal/10',
  cyan: 'from-cyan/30 via-signal/20 to-violet/10',
};

export function GlowCard({
  children,
  className,
  glowColor = 'signal',
}: GlowCardProps) {
  return (
    <motion.div
      variants={hoverLift}
      initial="rest"
      whileHover="hover"
      className={cn(
        'relative rounded-card overflow-hidden',
        'bg-[var(--glass-bg)] backdrop-blur-[var(--glass-blur)]',
        'border border-[var(--glass-border)]',
        'shadow-glass-default',
        'transition-shadow duration-500',
        glowColors[glowColor],
        className
      )}
    >
      {/* Animated gradient border */}
      <div
        className={cn(
          'absolute inset-0 rounded-card opacity-0 group-hover:opacity-100 transition-opacity duration-500',
          'pointer-events-none'
        )}
      >
        <div
          className={cn(
            'absolute inset-[-1px] rounded-card bg-gradient-to-br',
            borderGradients[glowColor]
          )}
          style={{
            WebkitMask:
              'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            padding: '1px',
          }}
        />
      </div>
      {/* Top specular highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
