export function Footer() {
  return (
    <footer className="w-full py-8 mt-auto border-t border-sage/40 bg-cream">
      <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-ink/70 text-body-sm">
          Built for <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" className="text-bottle-green hover:text-chocolate transition-colors">Credex</a> · credex.rocks
        </p>
        <div className="flex items-center gap-6 text-ink/70 text-body-sm">
          <a href="#" className="hover:text-bottle-green transition-colors">Privacy</a>
          <a href="/#how-it-works" className="hover:text-bottle-green transition-colors">How it works</a>
        </div>
      </div>
    </footer>
  );
}
