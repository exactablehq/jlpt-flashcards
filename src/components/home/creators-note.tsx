"use client";

import { useEffect, useRef, useState } from "react";

const NOTE = [
  "These are the notes I made while studying for my N5, tidied up and organised so they're easier to revise from. I hope they help you too!",
  "English meanings come from the JMdict and KANJIDIC2 dictionaries, and stroke order from KanjiVG. There may be a mistake or two, so do double-check with your own materials.",
  "It's just me and my notes here, with no affiliation to the JLPT or any other organisation. Happy studying! ✿",
];

/** Small "creator's note" button in the bottom-right corner of the homepage; opens a note above it. */
export function CreatorsNote() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // While open: Escape or a click outside closes the note.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    // Mirrors Casper on the other side: just above the footer text below 1280px, in the corner on wide screens.
    <div ref={rootRef} className="no-print absolute right-6 bottom-28 z-20 sm:right-8 sm:bottom-36 xl:bottom-8">
      <div
        id="creators-note"
        role="dialog"
        aria-label="Creator's note"
        inert={!open}
        className={`absolute right-0 bottom-full mb-3 w-[min(19rem,calc(100vw-3rem))] origin-bottom-right rounded-[1.75rem] border-2 border-accent bg-white px-5 pt-4 pb-5 text-left comic-shadow-lg transition duration-300 ease-out ${
          open ? "visible translate-y-0 scale-100 opacity-100" : "invisible translate-y-2 scale-95 opacity-0"
        }`}
      >
        <p className="font-study mb-2 text-lg text-accent">creator&rsquo;s note ✿</p>
        <div className="space-y-2 text-sm leading-relaxed text-ink-muted">
          {NOTE.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        {/* Little tail pointing down at the button. */}
        <span aria-hidden="true" className="absolute right-8 -bottom-[9px] size-4 rotate-45 border-r-2 border-b-2 border-accent bg-white" />
      </div>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="creators-note"
        className="rounded-full border-2 border-accent bg-white px-3 py-1 text-xs font-bold text-accent comic-shadow-sm transition duration-150 hover:-translate-y-0.5 hover:comic-shadow active:translate-y-0.5 active:comic-shadow-none sm:text-sm"
      >
        creator&rsquo;s note <span aria-hidden="true">✎</span>
      </button>
    </div>
  );
}
