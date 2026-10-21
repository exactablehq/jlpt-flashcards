"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { withBasePath } from "@/lib/paths";

type Strokes = { status: "loading" } | { status: "ready"; strokes: string[] } | { status: "missing" };

/** Seconds per stroke, and the pause between strokes. */
const STROKE_SECONDS = 0.55;
const GAP_SECONDS = 0.15;

const strokeCount = (n: number) => `${n} ${n === 1 ? "stroke" : "strokes"}`;

function strokeFile(kanji: string): string {
  const hex = kanji.codePointAt(0)!.toString(16).padStart(5, "0");
  return withBasePath(`/stroke-order/${hex}.json`);
}

/** "View stroke order" button plus the dialog that animates the kanji being written. */
export function StrokeOrderButton({ character }: { character: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => {
          dialogRef.current?.showModal();
          setOpen(true);
        }}
      >
        View stroke order
      </Button>
      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          // Clicking the dimmed backdrop (outside the panel) closes the dialog.
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
        aria-label={`Stroke order for ${character}`}
        className="m-auto w-[min(22rem,calc(100vw-2rem))] rounded-[1.75rem] border-2 border-accent bg-white p-0 text-ink comic-shadow-lg backdrop:bg-ink/30"
      >
        {open && <StrokeOrderPanel kanji={character} onClose={() => dialogRef.current?.close()} />}
      </dialog>
    </>
  );
}

function StrokeOrderPanel({ kanji, onClose }: { kanji: string; onClose: () => void }) {
  const [data, setData] = useState<Strokes>({ status: "loading" });
  const [replay, setReplay] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(strokeFile(kanji))
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((json: { strokes?: unknown }) => {
        const strokes = Array.isArray(json.strokes) ? json.strokes.filter((s): s is string => typeof s === "string") : [];
        if (!cancelled) setData(strokes.length > 0 ? { status: "ready", strokes } : { status: "missing" });
      })
      .catch(() => {
        if (!cancelled) setData({ status: "missing" });
      });
    return () => {
      cancelled = true;
    };
  }, [kanji]);

  return (
    <div className="relative px-6 pt-5 pb-6 text-center">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close stroke order"
        className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full text-lg text-ink-muted transition-colors hover:bg-sakura-soft hover:text-ink"
      >
        ×
      </button>
      <p className="font-study text-xl text-accent">stroke order ✿</p>

      <div className="mx-auto mt-4 aspect-square w-full max-w-[15rem] rounded-2xl border-2 border-sakura bg-paper">
        {data.status === "loading" && (
          <p className="flex size-full items-center justify-center text-sm text-ink-muted">Loading…</p>
        )}
        {data.status === "missing" && (
          <p className="flex size-full items-center justify-center px-6 text-sm text-ink-muted">
            Stroke order isn&rsquo;t available for this character yet.
          </p>
        )}
        {data.status === "ready" && (
          <svg key={replay} viewBox="0 0 109 109" className="size-full" role="img" aria-label={`${kanji}, ${strokeCount(data.strokes.length)}`}>
            {/* Faint outline of the whole character, then each stroke drawn in order. */}
            <g fill="none" stroke="var(--sakura-soft)" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
              {data.strokes.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>
            <g fill="none" stroke="var(--ink)" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
              {data.strokes.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  pathLength={1}
                  className="stroke-draw"
                  style={{
                    animationDuration: `${STROKE_SECONDS}s`,
                    animationDelay: `${0.3 + i * (STROKE_SECONDS + GAP_SECONDS)}s`,
                  }}
                />
              ))}
            </g>
          </svg>
        )}
      </div>

      {data.status === "ready" && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <span className="text-sm text-ink-muted">{strokeCount(data.strokes.length)}</span>
          <Button variant="secondary" size="sm" onClick={() => setReplay((n) => n + 1)}>
            Replay
          </Button>
        </div>
      )}

      <p className="mt-4 text-[0.7rem] text-ink-muted">
        Stroke data from{" "}
        <a href="https://kanjivg.tagaini.net" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">
          KanjiVG
        </a>{" "}
        (CC BY-SA 3.0)
      </p>
    </div>
  );
}
