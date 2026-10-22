import type { ReactNode } from "react";
import { MeowBuddy } from "@/components/ui/meow-buddy";

/**
 * Baby Casper keeps learners company, sitting still over the bottom-left
 * corner of the flashcard and hanging a little below it; on wide screens he
 * straddles the card's left edge. When `message` is set he says it in a comic
 * speech bubble. Only Casper himself takes clicks (for a quick "meow"); the
 * space around him never blocks taps on the card.
 */
export function FlashcardBuddy({ message }: { message?: ReactNode }) {
  return (
    <span className="pointer-events-none absolute -bottom-9 -left-3 z-10 w-28 sm:-left-8 sm:w-36 lg:left-0 lg:w-48 lg:-translate-x-1/2 xl:-bottom-10 xl:w-56">
      {/*
        Speech bubble, placed so it never covers the word on the card: to his
        right along the card's bottom on phones and tablets, above him on laptops, and out
        to the left over the painting on wide screens.
      */}
      {message && (
        <span
          role="status"
          className="font-study absolute bottom-10 left-full ml-1 block w-[min(14rem,calc(100vw-9.5rem))] -rotate-2 rounded-[1.25rem] border-2 border-accent bg-white px-4 py-3 text-left text-base leading-snug text-ink comic-shadow sm:bottom-6 sm:w-60 sm:text-lg lg:bottom-full lg:left-6 lg:mb-1 lg:ml-0 xl:right-1/2 xl:left-auto xl:w-64"
        >
          {message}
          <span
            aria-hidden="true"
            className="absolute top-1/2 -left-[9px] size-4 -translate-y-1/2 rotate-45 border-b-2 border-l-2 border-accent bg-white lg:top-auto lg:-bottom-[9px] lg:left-8 lg:translate-y-0 lg:border-l-0 lg:border-r-2 xl:right-8 xl:left-auto"
          />
        </span>
      )}
      {/* Easter egg: only Casper himself takes clicks, for a quick "meow". */}
      <MeowBuddy className="h-auto w-full drop-shadow-[4px_5px_0_rgb(173_77_102_/_0.32)]" />
    </span>
  );
}
