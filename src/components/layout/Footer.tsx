export function Footer() {
  return (
    <footer className="w-full py-8 mt-auto border-t border-[rgba(120,160,255,0.08)]">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[var(--text-secondary)] text-body-sm">
          Built for <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--text-primary)] transition-colors">Credex</a> · credex.rocks
        </p>
        <div className="flex items-center gap-6 text-[var(--text-secondary)] text-body-sm">
          <a href="#" className="hover:text-[var(--text-primary)] transition-colors">Privacy</a>
          <a href="/#how-it-works" className="hover:text-[var(--text-primary)] transition-colors">How it works</a>
        </div>
      </div>
    </footer>
  );
}
