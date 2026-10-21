export function SiteFooter() {
  return (
    // Extra bottom padding on narrow screens keeps the text above the painted rocks.
    <footer className="no-print px-4 pt-6 pb-14 text-center text-xs leading-relaxed text-ink-muted sm:pb-8 sm:text-sm">
      <p>Free for everyone · No accounts, ads or tracking.</p>
      <p className="mt-1 opacity-80">
        Made with lots of love{" "}
        <span aria-hidden="true" className="inline-block text-accent">
          ♥
        </span>
      </p>
    </footer>
  );
}
