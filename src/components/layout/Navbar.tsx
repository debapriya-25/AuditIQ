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
          ? 'bg-[rgba(255,253,248,0.85)] backdrop-blur-[16px] border-b border-sage/40 shadow-[0_1px_0_rgba(31,77,54,0.04)]'
          : 'bg-transparent border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-display font-bold text-lg text-bottle flex items-center gap-2">
          <span className="text-sap">●</span> AuditIQ
        </Link>
        <Link
          href="/audit"
          className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-[var(--radius-btn)] border border-bottle/30 text-bottle text-sm font-medium hover:bg-mint/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bottle focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
        >
          Run Your Own Audit
        </Link>
      </div>
    </header>
  );
}
