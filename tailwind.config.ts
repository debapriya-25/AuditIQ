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
        void: '#080C14',
        abyss: '#0D1320',
        depth: '#141B2D',
        surface: '#1C2540',
        overlay: '#232E4F',
        signal: '#3B82F6',
        'signal-glow': 'rgba(59, 130, 246, 0.25)',
        emerald: '#10B981',
        ember: '#F59E0B',
        crimson: '#EF4444',
        violet: '#8B5CF6',
        ice: '#BAE6FD',
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
        'glow-signal': '0 0 20px rgba(59, 130, 246, 0.4)',
        'glow-emerald': '0 0 20px rgba(16, 185, 129, 0.4)',
        'glow-ember': '0 0 20px rgba(245, 158, 11, 0.4)',
        'glass-default': '0 8px 32px rgba(0,0,0,0.35)',
        'glass-elevated': '0 25px 50px rgba(0,0,0,0.5)',
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite linear',
        'count-up': 'countUp 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};

export default config;
