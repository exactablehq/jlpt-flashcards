import Link from "next/link";

/** Centered wordmark, placed in the open space at the top of the painting. */
export function SiteHeader() {
  return (
    <header className="no-print flex justify-center px-4 pt-6 sm:pt-8">
      <Link
        href="/"
        aria-label="JLPTFlashcards home"
        className="font-display rounded-lg px-2 py-1 text-xl font-semibold tracking-wide text-ink transition-opacity hover:opacity-80 sm:text-2xl"
      >
        <span className="text-accent">JLPT</span>Flashcards
      </Link>
    </header>
  );
}
