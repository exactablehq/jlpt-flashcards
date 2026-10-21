"use client";

import { Squiggle } from "@/components/ui/comic";
import type { DeckCard } from "@/lib/flashcards/types";

interface FlashcardProps {
  card: DeckCard;
  flipped: boolean;
  onFlip: () => void;
  /** Marks a card repeated from an earlier set. */
  isReview?: boolean;
}

/**
 * Splits a usage hint off the word for display, e.g.
 * "やすみます [かいしゃ を ~]" → word "やすみます", hint "[かいしゃ を ~]".
 * Only affects layout; the full text is always shown.
 */
function splitHint(text: string): { word: string; hint: string | null } {
  const match = text.match(/^(.+?)\s*([[(（［].*)$/);
  return match ? { word: match[1], hint: match[2] } : { word: text, hint: null };
}

function frontSize(word: string): string {
  const length = [...word].length;
  if (length === 1) return "text-8xl sm:text-9xl";
  if (length <= 3) return "text-7xl sm:text-8xl";
  if (length <= 6) return "text-6xl sm:text-7xl";
  if (length <= 9) return "text-5xl sm:text-6xl";
  return "text-4xl sm:text-5xl";
}

// Comic panel faces: chunky outline and a solid offset shadow. On phones and
// tablets the extra bottom padding lifts the content clear of Casper in the corner.
const face =
  "absolute inset-0 flex flex-col items-center justify-center rounded-[28px] border-2 border-accent px-6 pt-8 pb-24 text-center comic-shadow-lg backface-hidden lg:py-10";

export function Flashcard({ card, flipped, onFlip, isReview }: FlashcardProps) {
  const { word, hint } = splitHint(card.front);
  const label = flipped
    ? `${card.back}${card.note ? `, ${card.note}` : ""}. Activate to show the word again.`
    : `${card.front}. Activate to show the meaning.`;

  return (
    <div className="perspective-[1600px]">
      <button
        type="button"
        onClick={onFlip}
        aria-label={label}
        className="group block h-[21rem] w-full rounded-[28px]"
      >
        <div
          className={`relative size-full transition-transform duration-500 ease-[cubic-bezier(0.3,0.7,0.2,1)] transform-3d ${
            flipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front */}
          <div className={`${face} bg-white`}>
            {isReview && (
              <span className="absolute top-4 left-4 -rotate-6 rounded-full border-2 border-accent bg-sakura-soft px-2.5 py-0.5 text-xs font-bold text-accent">
                Review
              </span>
            )}
            <span lang="ja" className={`font-study leading-tight break-keep text-ink ${frontSize(word)}`}>
              {word}
            </span>
            {hint && (
              <span lang="ja" className="font-study mt-3 text-xl text-ink-muted sm:text-2xl">
                {hint}
              </span>
            )}
            <span className="font-study absolute bottom-5 text-sm text-ink-muted/80">tap to reveal ✿</span>
          </div>

          {/* Back */}
          <div className={`${face} rotate-y-180 bg-[#fff7f9]`}>
            <span lang="ja" className="font-study text-xl text-ink-muted sm:text-2xl">
              {card.front}
            </span>
            <Squiggle className="my-3 w-16" />
            <span className="font-display comic-text max-w-md text-2xl leading-snug font-semibold text-balance text-ink sm:text-3xl">
              {card.back}
            </span>
            {card.note && (
              <span className="mt-4 -rotate-2 rounded-full border-2 border-accent bg-sakura-soft px-3 py-1 text-sm font-bold text-accent">
                {card.note}
              </span>
            )}
            {card.details && card.details.length > 0 && (
              <dl className="mt-5 grid grid-cols-[auto_1fr] items-baseline gap-x-4 gap-y-1.5 text-left text-sm sm:text-base">
                {card.details.map((detail) => (
                  <div key={detail.label} className="contents">
                    <dt className="text-ink-muted">{detail.label}</dt>
                    <dd lang="ja" className="font-study text-lg text-ink sm:text-xl">
                      {detail.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}
