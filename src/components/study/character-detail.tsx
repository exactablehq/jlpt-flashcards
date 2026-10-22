"use client";

import { useEffect, useRef } from "react";
import { StrokeOrderView } from "@/components/flashcards/stroke-order";
import { Squiggle } from "@/components/ui/comic";

/** What the pop-up card shows for one kana or kanji. Plain data, prepared at build time. */
export interface CharacterDetail {
  character: string;
  /** Main answer, e.g. romaji or the English meaning. */
  primary: string;
  /** Small tag, e.g. "Hiragana · Dakuten". */
  note?: string;
  /** Extra labelled lines, e.g. kanji readings. */
  details?: { label: string; value: string }[];
}

/**
 * A data card for one character, with its stroke order animating beside it
 * (below it on phones). Opens whenever `detail` is set; Escape, the × button
 * or a click on the dimmed backdrop calls `onClose`.
 */
export function CharacterDialog({ detail, onClose }: { detail: CharacterDetail | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (detail && dialog && !dialog.open) dialog.showModal();
  }, [detail]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current?.close();
      }}
      aria-label={detail ? `${detail.character}: ${detail.primary}` : undefined}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[min(40rem,calc(100vw-2rem))] overflow-y-auto rounded-[1.75rem] border-2 border-accent bg-white p-0 text-ink comic-shadow-lg backdrop:bg-ink/30"
    >
      {detail && (
        <div className="relative grid gap-2 px-6 pt-8 pb-6 sm:grid-cols-2 sm:items-center sm:gap-6 sm:p-8">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close"
            className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full text-lg text-ink-muted transition-colors hover:bg-sakura-soft hover:text-ink"
          >
            ×
          </button>

          <div className="flex flex-col items-center text-center">
            <span lang="ja" className="font-study text-8xl leading-tight text-ink">
              {detail.character}
            </span>
            <Squiggle className="my-3 w-16" />
            <span className="font-display comic-text text-2xl leading-snug font-semibold text-balance sm:text-3xl">
              {detail.primary}
            </span>
            {detail.note && (
              <span className="mt-3 -rotate-2 rounded-full border-2 border-accent bg-sakura-soft px-3 py-1 text-sm font-bold text-accent">
                {detail.note}
              </span>
            )}
            {detail.details && detail.details.length > 0 && (
              <dl className="mt-4 grid grid-cols-[auto_1fr] items-baseline gap-x-4 gap-y-1.5 text-left">
                {detail.details.map((line) => (
                  <div key={line.label} className="contents">
                    <dt className="text-sm text-ink-muted">{line.label}</dt>
                    <dd lang="ja" className="font-study text-lg text-ink">
                      {line.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          <div className="text-center">
            <p className="font-study mt-4 text-lg text-accent sm:mt-0">stroke order ✿</p>
            <StrokeOrderView key={detail.character} character={detail.character} />
          </div>
        </div>
      )}
    </dialog>
  );
}
