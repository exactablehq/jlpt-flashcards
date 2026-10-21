"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import {
  countUnseen,
  dealNextBatch,
  reconcileProgress,
  shuffleBatch,
  startRound,
  type DeckProgress,
  type RoundMode,
} from "@/lib/flashcards/batching";
import { readStored, removeStored, writeStored } from "@/lib/flashcards/storage";
import type { DeckCard } from "@/lib/flashcards/types";
import { Flashcard } from "./flashcard";
import { FlashcardBuddy } from "./flashcard-buddy";
import { StrokeOrderButton } from "./stroke-order";

interface DeckProps {
  cards: DeckCard[];
  /** Unique per deck, e.g. "n5:vocabulary:verbs", so progress is kept separately. */
  storageKey: string;
  /** What the cards are, for messages: "words", "characters". */
  noun?: string;
  /** Kanji decks: offer a stroke-order animation for the current card. */
  strokeOrder?: boolean;
}

const noopSubscribe = () => () => {};

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

function DeckSession({ cards, storageKey, noun = "cards", strokeOrder = false }: DeckProps) {
  const allIds = useMemo(() => cards.map((card) => card.id), [cards]);
  const byId = useMemo(() => new Map(cards.map((card) => [card.id, card])), [cards]);

  const [progress, setProgress] = useState<DeckProgress>(
    () => reconcileProgress(readStored(storageKey), allIds) ?? startRound(allIds, "ordered", Math.random),
  );
  const [flipped, setFlipped] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);

  useEffect(() => {
    writeStored(storageKey, progress);
  }, [storageKey, progress]);

  const { batch, index, batchNumber } = progress;
  const card = byId.get(batch[index])!;
  const atStart = index === 0;
  const atEnd = index === batch.length - 1;
  const remaining = countUnseen(allIds, progress);
  const roundComplete = remaining === 0;
  const covered = allIds.length - remaining;
  const hasMultipleSets = allIds.length > batch.length || batchNumber > 1;

  function apply(next: DeckProgress) {
    setProgress(next);
    setFlipped(false);
    setConfirmingReset(false);
  }

  function go(delta: number) {
    const target = Math.min(Math.max(index + delta, 0), batch.length - 1);
    if (target !== index) apply({ ...progress, index: target });
  }

  const flip = () => setFlipped((value) => !value);
  const shuffleSet = () => apply(shuffleBatch(progress, Math.random));
  const seeMore = () => {
    const next = dealNextBatch(allIds, progress, Math.random);
    if (next) apply(next);
  };
  const newRound = (mode: RoundMode) => apply(startRound(allIds, mode, Math.random));
  const resetProgress = () => {
    removeStored(storageKey);
    newRound("ordered");
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
      <div className="mb-4 flex items-center justify-between px-1">
        <span className="font-study text-lg text-ink-muted">
          {hasMultipleSets ? `set ${batchNumber}` : `all ${allIds.length} ${noun}`}
        </span>
        <span
          aria-live="polite"
          className="rotate-2 rounded-full border-2 border-accent bg-white px-3 py-0.5 text-sm font-bold text-accent tabular-nums comic-shadow-sm"
        >
          {index + 1} / {batch.length}
        </span>
      </div>

      <div className="relative">
        <Flashcard card={card} flipped={flipped} onFlip={flip} isReview={progress.review.includes(card.id)} />
        {batch.length > 1 && (
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
        <FlashcardBuddy
          message={
            atEnd && roundComplete ? (
              <>
                you&rsquo;ve gone through all {allIds.length} {noun}!{" "}
                <span lang="ja" className="whitespace-nowrap">
                  よくできました！
                </span>
              </>
            ) : undefined
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
          aria-valuenow={index + 1}
        >
          <div
            className="h-full bg-sakura transition-[width] duration-300 ease-out"
            style={{ width: `${((index + 1) / batch.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button variant="secondary" size="lg" onClick={() => go(-1)} disabled={atStart}>
          <span aria-hidden="true">←</span> Previous
        </Button>
        {/* On touch screens, tapping the card flips it, so this is desktop-only. */}
        <span className="hidden sm:block">
          <Button variant="ghost" onClick={flip}>
            {flipped ? "Show word" : "Show meaning"}
          </Button>
        </span>
        <Button variant="primary" size="lg" onClick={() => go(1)} disabled={atEnd}>
          Next <span aria-hidden="true">→</span>
        </Button>
      </div>

      {strokeOrder && (
        <div className="mt-4 flex justify-center">
          <StrokeOrderButton key={card.id} character={card.front} />
        </div>
      )}

      {atEnd && (
        <div className="mt-8 text-center">
          {roundComplete ? (
            <>
              <p className="font-study text-lg text-ink-muted">start again in the original order, or reshuffle everything.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <Button onClick={() => newRound("ordered")}>Restart</Button>
                <Button variant="secondary" onClick={() => newRound("random")}>
                  Reshuffle all
                </Button>
              </div>
            </>
          ) : (
            <div role="status">
              <p className="font-study text-2xl text-ink">end of set {batchNumber}! ✿</p>
              <p className="mt-1 text-sm text-ink-muted">
                {remaining} new {noun} still to come.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <Button onClick={seeMore}>See more</Button>
                <Button variant="secondary" onClick={shuffleSet}>
                  Shuffle this set
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-10 flex flex-col items-center gap-3 border-t-2 border-dashed border-sakura/60 pt-6">
        <div className="flex flex-wrap items-center justify-center gap-2">
          {!roundComplete && (
            <Button variant="secondary" size="sm" onClick={seeMore}>
              See more
            </Button>
          )}
          {confirmingReset ? (
            <span className="flex items-center gap-1 text-sm text-ink-muted">
              Clear progress for this deck?
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
        <p className="text-center text-xs text-ink-muted">
          {covered} of {allIds.length} {noun} in your sets so far · saved on this device
        </p>
        <p className="hidden text-xs text-ink-muted/80 sm:block">Keyboard: ← → to move · Space to flip</p>
      </div>
    </div>
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
