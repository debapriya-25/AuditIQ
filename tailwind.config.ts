import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        void: '#050810',
        abyss: '#0A0F1E',
        depth: '#111827',
        surface: '#1A2235',
        overlay: '#232E4F',
        signal: '#3B82F6',
        'signal-glow': 'rgba(59, 130, 246, 0.25)',
        emerald: '#10B981',
        ember: '#F59E0B',
        crimson: '#EF4444',
        violet: '#8B5CF6',
        ice: '#BAE6FD',
        cyan: '#22D3EE',
        fuchsia: '#D946EF',
        indigo: '#6366F1',
      },
      fontFamily: {
        display: ['Clash Display', 'Syne', 'sans-serif'],
        sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        'display-2xl': ['72px', { lineHeight: '1.0', letterSpacing: '-0.03em', fontWeight: '700' }],
        'display-xl': ['56px', { lineHeight: '1.05', letterSpacing: '-0.025em', fontWeight: '700' }],
        'display-lg': ['40px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-md': ['32px', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '600' }],
        'display-sm': ['24px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.7', letterSpacing: '0' }],
        'body-md': ['16px', { lineHeight: '1.65', letterSpacing: '0' }],
        'body-sm': ['14px', { lineHeight: '1.6', letterSpacing: '0.01em' }],
        label: ['12px', { lineHeight: '1.5', letterSpacing: '0.06em', fontWeight: '500' }],
        'mono-lg': ['20px', { lineHeight: '1.4' }],
        'mono-md': ['16px', { lineHeight: '1.4' }],
        'mono-sm': ['13px', { lineHeight: '1.4' }],
      },
      boxShadow: {
        'glow-signal': '0 0 20px rgba(59, 130, 246, 0.35), 0 0 60px rgba(59, 130, 246, 0.10)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.35), 0 0 60px rgba(16, 185, 129, 0.10)',
        'glow-ember': '0 0 20px rgba(245, 158, 11, 0.35), 0 0 60px rgba(245, 158, 11, 0.10)',
        'glow-violet': '0 0 20px rgba(139, 92, 246, 0.35), 0 0 60px rgba(139, 92, 246, 0.10)',
        'glow-cyan': '0 0 20px rgba(34, 211, 238, 0.35), 0 0 60px rgba(34, 211, 238, 0.10)',
        'glass-default': '0 8px 32px rgba(0, 0, 0, 0.35)',
        'glass-elevated': '0 25px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        'glass-subtle': '0 2px 16px rgba(0, 0, 0, 0.20)',
        'inner-glow': 'inset 0 1px 0 rgba(255, 255, 255, 0.06)',
      },
      backgroundImage: {
        'aurora-gradient': 'linear-gradient(135deg, var(--aurora-1), var(--aurora-2), var(--aurora-3), var(--aurora-4), var(--aurora-5))',
        'radial-void': 'radial-gradient(ellipse at center top, var(--color-abyss) 0%, var(--color-void) 70%)',
        'gradient-mesh': 'radial-gradient(at 20% 80%, var(--aurora-1) 0px, transparent 50%), radial-gradient(at 80% 20%, var(--aurora-3) 0px, transparent 50%), radial-gradient(at 50% 50%, var(--aurora-2) 0px, transparent 70%)',
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite linear',
        'aurora-shift': 'aurora-shift 8s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'spotlight-sweep': 'spotlight-sweep 5s ease-in-out infinite',
        'gradient-rotate': 'gradient-rotate 10s linear infinite',
        'fade-in-up': 'fade-in-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'aurora-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        'spotlight-sweep': {
          '0%': { transform: 'translateX(-100%) rotate(15deg)' },
          '100%': { transform: 'translateX(200%) rotate(15deg)' },
        },
        'gradient-rotate': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      borderRadius: {
        card: 'var(--radius-card)',
        btn: 'var(--radius-btn)',
        badge: 'var(--radius-badge)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
  ],
};

export default config;
