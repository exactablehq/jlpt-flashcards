"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode, type TouchEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  countUnseen,
  goToSet,
  reconcileProgress,
  shuffleBatch,
  splitEvenly,
  type DeckProgress,
} from "@/lib/flashcards/batching";
import { clearAllStored, readStored, writeStored } from "@/lib/flashcards/storage";
import type { DeckCard } from "@/lib/flashcards/types";
import { Flashcard } from "./flashcard";
import { FlashcardBuddy } from "./flashcard-buddy";
import { StrokeOrderButton } from "./stroke-order";

interface DeckProps {
  cards: DeckCard[];
  /** Fixed sets of card IDs (e.g. whole study sets). Defaults to even sets of about 50 in card order. */
  sets?: string[][];
  /** Unique per deck, e.g. "n5:vocabulary:verbs", so progress is kept separately. */
  storageKey: string;
  /** What the cards are, for messages: "words", "characters". */
  noun?: string;
  /** Kanji decks: offer a stroke-order animation for the current card. */
  strokeOrder?: boolean;
}

const noopSubscribe = () => () => {};

/** A random item that differs from `current`. */
function pickOther(items: readonly string[], current: string): string {
  const others = items.filter((item) => item !== current);
  return others[Math.floor(Math.random() * others.length)];
}

/** What Casper says at the end of each set. */
const CHEERS = [
  "good job! ✿",
  "nice work!",
  "meow, you've got this!",
  "look at you go!",
  "so proud of you ♡",
  "one more set down!",
  "purrfect! ✿",
  "you're doing amazing!",
  "がんばって！",
  "すごい！ keep it up!",
  "tiny steps, big progress ♡",
  "meow meow, well done!",
];

/**
 * The deck reads saved progress from localStorage, which only exists in the
 * browser. Until the page has hydrated, show a placeholder of the same size.
 */
export function FlashcardDeck(props: DeckProps) {
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  return hydrated ? <DeckSession {...props} /> : <DeckPlaceholder />;
}

function DeckPlaceholder() {
  return (
    <div className="mx-auto w-full max-w-2xl" aria-busy="true">
      <div className="mb-4 h-5" />
      <div className="font-study flex h-[21rem] items-center justify-center rounded-[28px] border-2 border-accent bg-white text-lg text-ink-muted comic-shadow-lg">
        preparing your cards…
      </div>
    </div>
  );
}

function DeckSession({ cards, sets, storageKey, noun = "cards", strokeOrder = false }: DeckProps) {
  const allIds = useMemo(() => cards.map((card) => card.id), [cards]);
  const byId = useMemo(() => new Map(cards.map((card) => [card.id, card])), [cards]);

  const deckSets = useMemo(() => sets ?? splitEvenly(allIds), [sets, allIds]);
  // Opening the page always starts at card 1 of a freshly shuffled set; only the set number is remembered.
  const [progress, setProgress] = useState<DeckProgress>(() => {
    const saved = reconcileProgress(readStored(storageKey), deckSets, Math.random);
    return goToSet(deckSets, saved, saved?.batchNumber ?? 1, Math.random);
  });
  const [flipped, setFlipped] = useState(false);
  // Picked each time the end-of-set card is reached, so Casper says something different.
  const [cheer, setCheer] = useState(CHEERS[0]);
  const [confirmingReset, setConfirmingReset] = useState(false);

  useEffect(() => {
    writeStored(storageKey, progress);
  }, [storageKey, progress]);

  const { batch, index, batchNumber } = progress;
  // One step past the last card is the "end of set" card.
  const onEndCard = index === batch.length;
  const card = onEndCard ? null : byId.get(batch[index])!;
  const atStart = index === 0;
  const remaining = countUnseen(allIds, progress);
  const covered = allIds.length - remaining;
  const totalSets = deckSets.length;
  const isLastSet = batchNumber === totalSets;
  const allDone = isLastSet && remaining === 0;

  function apply(next: DeckProgress) {
    setProgress(next);
    setFlipped(false);
    setConfirmingReset(false);
  }

  function go(delta: number) {
    const target = Math.min(Math.max(index + delta, 0), batch.length);
    if (target === index) return;
    if (target === batch.length) setCheer((current) => pickOther(CHEERS, current));
    apply({ ...progress, index: target });
  }

  const flip = () => setFlipped((value) => !value);

  // Phones: swipe left for the next card, right for the previous one. On the
  // end-of-set card, swiping left deals the next set.
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  function onTouchStart(event: TouchEvent) {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  }
  function onTouchEnd(event: TouchEvent) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    // Mostly sideways and far enough to be deliberate, so scrolling and taps are left alone.
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx > 0) go(-1);
    else if (onEndCard) {
      if (!isLastSet) seeMore();
    } else go(1);
  }
  const shuffleSet = () => apply(shuffleBatch(progress, Math.random));
  const restartSet = () => apply({ ...progress, index: 0 });
  // Sets can be opened in any order; each opens freshly shuffled at its first card.
  const openSet = (number: number) => apply(goToSet(deckSets, progress, number, Math.random));
  const seeMore = () => openSet(batchNumber + 1);
  // Hard reset: wipes saved progress for every deck, then starts this one again from set 1.
  const resetProgress = () => {
    clearAllStored();
    apply(goToSet(deckSets, null, 1, Math.random));
  };

  // Keyboard: ← → move between cards; Space or Enter flips (unless a button has focus,
  // where those keys already activate the button).
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target instanceof Element ? event.target : document.body;
      if (target.closest("input, textarea, select, dialog, [contenteditable='true']")) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        go(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(-1);
      } else if ((event.key === " " || event.key === "Enter") && !target.closest("button, a")) {
        event.preventDefault();
        flip();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* How to get around: keyboard on laptops, gestures on touch screens. */}
      <p className="mb-3 text-center text-xs text-ink-muted/80">
        <span className="pointer-coarse:hidden">Keyboard: ← → to move · Space/Enter to flip</span>
        <span className="hidden pointer-coarse:inline">Swipe left/right · tap to reveal</span>
      </p>
      <p className="mb-3 text-center text-xs text-ink-muted">
        {covered} of {allIds.length} {noun} in your sets so far · saved on this device
      </p>
      <div className="mb-4 flex items-center justify-between px-1">
        {totalSets > 1 ? (
          <span className="flex items-center gap-1.5">
            <SetArrow direction="previous" disabled={batchNumber === 1} onClick={() => openSet(batchNumber - 1)} />
            <span className="font-study min-w-[5.5rem] text-center text-lg text-ink-muted">
              set {batchNumber} of {totalSets}
            </span>
            <SetArrow direction="next" disabled={isLastSet} onClick={() => openSet(batchNumber + 1)} />
          </span>
        ) : (
          <span className="font-study text-lg text-ink-muted">
            all {allIds.length} {noun}
          </span>
        )}
        <span
          aria-live="polite"
          className="rotate-2 rounded-full border-2 border-accent bg-white px-3 py-0.5 text-sm font-bold text-accent tabular-nums comic-shadow-sm"
        >
          {Math.min(index + 1, batch.length)} / {batch.length}
        </span>
      </div>

      <div className="relative" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {card ? (
          // Keyed by card so a new card mounts face-up. Without the key, the old card's flip-back
          // animation would briefly show the new card's meaning.
          <Flashcard
            key={card.id}
            card={card}
            flipped={flipped}
            onFlip={flip}
            isReview={progress.review.includes(card.id)}
          />
        ) : (
          <EndOfSetCard
            heading={
              !isLastSet ? `end of set ${batchNumber}! ✿` : allDone ? "all done! ✿" : "that's the last set! ✿"
            }
            detail={
              !isLastSet
                ? remaining > 0
                  ? `${remaining} new ${noun} still to come.`
                  : `next up: set ${batchNumber + 1}.`
                : allDone
                  ? `you've seen all ${allIds.length} ${noun}.`
                  : `${remaining} ${noun} are in sets you skipped.`
            }
          >
            <Button variant="secondary" onClick={shuffleSet}>
              Shuffle this set again
            </Button>
            {!isLastSet && (
              <Button onClick={seeMore}>
                Next set <span aria-hidden="true">→</span>
              </Button>
            )}
          </EndOfSetCard>
        )}
        {card && index > 0 && (
          <button
            type="button"
            onClick={restartSet}
            aria-label="Back to the start of this set"
            title="Back to the start of this set"
            className="absolute top-3 left-3 z-20 flex size-9 items-center justify-center rounded-full border-2 border-accent bg-white text-accent comic-shadow-sm transition duration-150 hover:-translate-y-0.5 hover:comic-shadow active:translate-y-0.5 active:comic-shadow-none"
          >
            <RestartIcon />
          </button>
        )}
        {card && batch.length > 1 && (
          <button
            type="button"
            onClick={shuffleSet}
            aria-label="Shuffle this set"
            title="Shuffle this set"
            className="absolute top-3 right-3 z-20 flex size-9 items-center justify-center rounded-full border-2 border-accent bg-white text-accent comic-shadow-sm transition duration-150 hover:-translate-y-0.5 hover:comic-shadow active:translate-y-0.5 active:comic-shadow-none"
          >
            <ShuffleIcon />
          </button>
        )}
        {strokeOrder && card && (
          <div className="absolute right-3 bottom-3 z-20">
            <StrokeOrderButton key={card.id} character={card.front} />
          </div>
        )}
        <FlashcardBuddy
          message={
            !onEndCard ? undefined : allDone ? (
              <>
                you&rsquo;ve gone through all {allIds.length} {noun}!{" "}
                <span lang="ja" className="whitespace-nowrap">
                  よくできました！
                </span>
              </>
            ) : (
              cheer
            )
          }
        />
      </div>

      {/* Where you are in this set. Kept clear of Casper, who hangs over the card's left edge. */}
      <div className="mt-6 ml-auto w-[58%] sm:mx-auto sm:w-80">
        <div
          className="h-3.5 overflow-hidden rounded-full border-2 border-accent bg-white"
          role="progressbar"
          aria-label="Progress through this set"
          aria-valuemin={1}
          aria-valuemax={batch.length}
          aria-valuenow={Math.min(index + 1, batch.length)}
        >
          <div
            className="h-full bg-sakura transition-[width] duration-300 ease-out"
            style={{ width: `${(Math.min(index + 1, batch.length) / batch.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button variant="secondary" size="lg" onClick={() => go(-1)} disabled={atStart}>
          <span aria-hidden="true">←</span> Previous
        </Button>
        {/* On the end-of-set card, Next becomes "See more" (or "Start again" once every set is done). */}
        {!onEndCard ? (
          <Button variant="primary" size="lg" onClick={() => go(1)}>
            Next <span aria-hidden="true">→</span>
          </Button>
        ) : isLastSet ? (
          <Button variant="primary" size="lg" onClick={() => openSet(1)}>
            Start again
          </Button>
        ) : (
          <Button variant="primary" size="lg" onClick={seeMore}>
            See more <span aria-hidden="true">→</span>
          </Button>
        )}
      </div>

      <div className="mt-10 flex flex-col items-center gap-3 border-t-2 border-dashed border-sakura/60 pt-6">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {confirmingReset ? (
            <span className="flex items-center gap-1 text-sm text-ink-muted">
              Clear progress for every deck?
              <Button variant="ghost" size="sm" onClick={resetProgress} className="text-accent">
                Yes, reset
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmingReset(false)}>
                Cancel
              </Button>
            </span>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => setConfirmingReset(true)}>
              Reset progress
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Shown one step after the last card, the same size as a flashcard. */
function EndOfSetCard({ heading, detail, children }: { heading: string; detail: string; children: ReactNode }) {
  return (
    <div
      role="status"
      className="flex h-[21rem] flex-col items-center justify-center rounded-[28px] border-2 border-accent bg-white px-6 pt-8 pb-24 text-center comic-shadow-lg lg:py-10"
    >
      <p className="font-study text-3xl text-ink sm:text-4xl">{heading}</p>
      <p className="mt-2 text-ink-muted">{detail}</p>
      <div className="mt-6 flex flex-col items-center gap-3">{children}</div>
    </div>
  );
}

/** ‹ / › buttons beside "set N of M", to jump between sets at any point. */
function SetArrow({
  direction,
  disabled,
  onClick,
}: {
  direction: "previous" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`${direction === "previous" ? "Previous" : "Next"} set`}
      title={`${direction === "previous" ? "Previous" : "Next"} set`}
      className="flex size-7 items-center justify-center rounded-full border-2 border-accent bg-white text-sm font-bold text-accent comic-shadow-sm transition duration-150 hover:-translate-y-0.5 hover:comic-shadow active:translate-y-0.5 active:comic-shadow-none disabled:pointer-events-none disabled:opacity-35"
    >
      <span aria-hidden="true">{direction === "previous" ? "‹" : "›"}</span>
    </button>
  );
}

function RestartIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function ShuffleIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 3h5v5" />
      <path d="M4 20 21 3" />
      <path d="M21 16v5h-5" />
      <path d="m15 15 6 6" />
      <path d="M4 4l5 5" />
    </svg>
  );
}
