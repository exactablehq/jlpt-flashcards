import Link from "next/link";
import { HeaderNav } from "./header-nav";

/** Centered wordmark, placed in the open space at the top of the painting, with Back and the decks menu at top left. */
export function SiteHeader() {
  return (
    <header className="no-print relative flex justify-center px-4 pt-6 sm:pt-8">
      <HeaderNav />
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
