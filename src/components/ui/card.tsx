import Link from "next/link";
import type { ReactNode } from "react";
import { comicPanel, comicPress } from "./comic";

interface LinkCardProps {
  href: string;
  title: ReactNode;
  description?: ReactNode;
  /** Large decorative glyph, e.g. あ or 漢. */
  glyph?: ReactNode;
  /** Small sticker beside the title, e.g. "New". */
  badge?: ReactNode;
  /** Secondary line under the description, e.g. a count. */
  meta?: ReactNode;
}

/** A clickable comic panel used for navigation choices (sections, categories). */
export function LinkCard({ href, title, description, glyph, badge, meta }: LinkCardProps) {
  return (
    <Link href={href} className={`${comicPanel} ${comicPress} group flex items-center gap-4 p-4 sm:gap-5 sm:p-5`}>
      {glyph && (
        <span
          aria-hidden="true"
          lang="ja"
          className="font-study flex size-14 shrink-0 -rotate-3 items-center justify-center rounded-2xl border-2 border-accent bg-sakura-soft text-3xl text-accent transition-transform duration-200 group-hover:rotate-3 sm:size-16 sm:text-4xl"
        >
          {glyph}
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-lg font-bold text-ink">{title}</span>
          {badge && (
            <span className="rotate-2 rounded-full border-2 border-accent bg-sakura-soft px-2 py-0.5 text-[0.7rem] font-bold text-accent">
              {badge}
            </span>
          )}
        </span>
        {description && <span className="text-sm text-ink-muted">{description}</span>}
        {meta && <span className="text-xs font-bold text-accent">{meta}</span>}
      </span>
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-accent bg-accent text-white comic-shadow-sm transition-transform duration-200 group-hover:translate-x-0.5"
      >
        →
      </span>
    </Link>
  );
}
