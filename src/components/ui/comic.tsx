import type { HTMLAttributes } from "react";

/** A small comic speech bubble with a tail pointing down, e.g. for a page's Japanese label. */
export function SpeechBubble({ className = "", children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={`relative -rotate-3 rounded-2xl border-2 border-accent bg-white px-4 py-1.5 font-bold text-accent comic-shadow-sm ${className}`}
      {...props}
    >
      {children}
      <span
        aria-hidden="true"
        className="absolute -bottom-[7px] left-1/2 size-3 -translate-x-1/2 rotate-45 border-r-2 border-b-2 border-accent bg-white"
      />
    </p>
  );
}

/** A hand-drawn wavy line, used instead of ruled dividers. */
export function Squiggle({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 120 12" className={`h-3 w-28 text-sakura ${className}`}>
      <path
        d="M2 6 Q 9.5 0 17 6 T 32 6 T 47 6 T 62 6 T 77 6 T 92 6 T 107 6 T 118 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Classes for a comic panel: white, chunky outline, solid offset shadow. */
export const comicPanel = "rounded-[1.5rem] border-2 border-accent bg-white comic-shadow";

/** Adds a lift on hover and a squish when pressed, for clickable comic panels. */
export const comicPress =
  "transition duration-200 ease-out hover:-translate-y-1 hover:comic-shadow-lg active:translate-x-0.5 active:translate-y-0.5 active:comic-shadow-sm";
