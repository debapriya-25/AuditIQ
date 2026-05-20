'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-[rgba(8,12,20,0.85)] backdrop-blur-[16px] border-b border-[rgba(120,160,255,0.10)] shadow-[0_1px_0_rgba(120,160,255,0.05)]' 
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-display font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
          <span className="text-[var(--color-signal)]">●</span> AuditIQ
        </Link>
        <Link 
          href="/audit" 
          className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-[var(--radius-btn)] border border-[rgba(59,130,246,0.4)] text-[var(--color-signal)] text-sm font-medium hover:bg-[rgba(59,130,246,0.1)] hover:border-opacity-100 transition-colors"
        >
          Run Your Own Audit
        </Link>
      </div>
    </header>
  );
}
