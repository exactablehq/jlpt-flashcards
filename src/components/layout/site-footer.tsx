export function SiteFooter() {
  return (
    // Pinned to the bottom of the screen with a little breathing room (plus the phone's safe area).
    <footer className="no-print px-4 pt-6 pb-[max(1rem,env(safe-area-inset-bottom))] text-center text-xs leading-relaxed text-ink-muted sm:pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:text-sm">
      <p>Free for everyone · No accounts, ads or tracking.</p>
      <p className="mt-1 opacity-80">
        Made with lots of love{" "}
        <span aria-hidden="true" className="inline-block text-accent">
          ♥
        </span>
      </p>
      <p className="mt-1 text-[0.7rem] opacity-70 sm:text-xs">
        Not affiliated with the JLPT, the Japan Foundation or JEES.
      </p>
    </footer>
  );
}
