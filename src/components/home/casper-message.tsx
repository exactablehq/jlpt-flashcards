"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { withBasePath } from "@/lib/paths";

const MESSAGE = [
  "my n5 notes to you, for free.",
  "no need to share your data, no payment needed.",
  "hope the ai slop is bearable, and all the best for jlpt! :)",
  "please feel free to email me with corrections, if any!",
];

/** Baby Casper sits in the bottom-left corner and opens a little note when clicked. */
export function CasperMessage() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // While open: Escape or a click outside closes the note.
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
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
    // Below 1280px Casper sits just above the footer text. On wide screens he sits in the misty open
    // area above the left-hand rocks. The left offset grows with the screen (≈153px at 1280px, ≈286px at 1920px).
    <div
      ref={rootRef}
      className="casper no-print absolute bottom-28 left-6 z-20 sm:bottom-36 sm:left-8 xl:bottom-[4.5rem] xl:left-[calc(20.8vw-7rem)]"
    >
      <div
        id="casper-message"
        role="dialog"
        aria-label="A message from Baby Casper"
        inert={!open}
        className={`absolute bottom-full left-0 mb-3 w-[min(20rem,calc(100vw-2rem))] origin-bottom-left rounded-[1.75rem] border-2 border-accent bg-white px-6 pt-5 pb-6 text-left comic-shadow-lg transition duration-300 ease-out ${
          open ? "visible translate-y-0 scale-100 opacity-100" : "invisible translate-y-2 scale-95 opacity-0"
        }`}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={() => {
            setOpen(false);
            triggerRef.current?.focus();
          }}
          aria-label="Close message"
          className="absolute top-3 right-3 flex size-8 items-center justify-center rounded-full text-lg text-ink-muted transition-colors hover:bg-sakura-soft hover:text-ink"
        >
          ×
        </button>
        {/* Same hand-lettered font as "Welcome to" in the hero. */}
        <p className="font-study mb-2 pr-6 text-xl text-accent">meow ✿</p>
        <div className="font-study space-y-2 text-base leading-relaxed text-ink">
          {MESSAGE.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        {/* Little tail pointing down at Casper. */}
        <span aria-hidden="true" className="absolute -bottom-[9px] left-8 size-4 rotate-45 border-r-2 border-b-2 border-accent bg-white" />
      </div>

      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="casper-message"
        className="group relative block rounded-full text-left"
      >
        <Image
          src={withBasePath("/images/casper.webp")}
          alt=""
          width={192}
          height={192}
          className="size-[5.5rem] rounded-full shadow-[0_10px_24px_-10px_rgb(120_60_80_/_0.55)] ring-[3px] ring-white transition-transform duration-300 group-hover:-translate-y-1 group-hover:-rotate-3 sm:size-28 xl:size-48"
        />
        {/* Comic speech bubble above his head; it steps aside while the message is open. */}
        <span
          className={`absolute bottom-full left-0 mb-3 -rotate-3 whitespace-nowrap transition duration-300 group-hover:-rotate-1 sm:left-1/2 sm:-translate-x-1/3 ${
            open ? "scale-90 opacity-0" : "opacity-100"
          }`}
        >
          <span className="relative block rounded-[1.25rem] border-[1.5px] border-accent/70 bg-white px-4 py-2 text-sm font-medium text-ink shadow-[2px_3px_0_0_rgb(173_77_102_/_0.25)] sm:text-base">
            Baby Casper has a message for you
            {/* Tail pointing down at Casper. */}
            <span
              aria-hidden="true"
              className="absolute -bottom-[7px] left-11 size-3 -translate-x-1/2 rotate-45 sm:left-1/3 border-r-[1.5px] border-b-[1.5px] border-accent/70 bg-white"
            />
          </span>
        </span>
      </button>
    </div>
  );
}
