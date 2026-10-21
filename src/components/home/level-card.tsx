import Link from "next/link";
import { Fragment } from "react";
import type { JlptLevel } from "@/config/levels";

/**
 * The homepage call to action for a JLPT level, drawn like a comic panel:
 * a chunky outline and solid offset shadow. It lifts on hover and squishes
 * down when pressed, like a real button.
 */
export function LevelCard({ level }: { level: JlptLevel }) {
  return (
    <Link
      href={`/${level.id}/`}
      aria-label={`Start ${level.label}: ${level.sections.join(", ")}`}
      className="group relative block -rotate-1 rounded-[1.75rem] border-2 border-accent bg-white px-4 pt-5 pb-4 text-left comic-shadow transition duration-200 ease-out hover:-translate-y-1 hover:rotate-0 hover:comic-shadow-lg active:translate-x-0.5 active:translate-y-0.5 active:comic-shadow-sm sm:px-5"
    >
      {/* Little sticker tag on the corner. */}
      <span className="absolute -top-3.5 right-5 rotate-3 rounded-full border-2 border-accent bg-sakura-soft px-3 py-0.5 text-xs font-bold text-accent transition-transform duration-200 group-hover:rotate-6">
        Perfect for beginners ✿
      </span>

      <span className="flex items-center gap-3.5 sm:gap-4">
        <span
          aria-hidden="true"
          className="font-display flex size-14 shrink-0 -rotate-6 items-center justify-center rounded-full border-2 border-accent bg-accent text-xl font-semibold text-white ring-[3px] ring-white ring-inset transition-transform duration-200 group-hover:rotate-6"
        >
          {level.shortLabel}
        </span>

        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-xl font-bold text-ink">{level.label}</span>
          {/* Each name keeps its separator, so lines only break between sections. */}
          <span className="text-sm text-ink-muted">
            {level.sections.map((section, index) => (
              <Fragment key={section}>
                <span className="whitespace-nowrap">
                  {section}
                  {index < level.sections.length - 1 && <span className="ml-1.5 mr-0.5 text-sakura">·</span>}
                </span>{" "}
              </Fragment>
            ))}
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-1.5 rounded-full border-2 border-accent bg-accent px-3 py-2 text-sm font-bold text-white comic-shadow-sm transition-colors group-hover:bg-accent-hover sm:px-4">
          <span className="hidden sm:inline">Let&rsquo;s go!</span>
          <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">
            →
          </span>
        </span>
      </span>
    </Link>
  );
}
