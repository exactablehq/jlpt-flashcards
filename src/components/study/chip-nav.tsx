import Link from "next/link";

export interface Chip {
  label: string;
  href: string;
  current?: boolean;
}

/** A row of comic pill links, e.g. to the other decks or categories. */
export function ChipNav({ title, chips }: { title: string; chips: Chip[] }) {
  return (
    <nav aria-label={title} className="no-print mt-14 text-center">
      <p className="font-study mb-4 text-lg text-ink-muted">{title}</p>
      <ul className="flex flex-wrap justify-center gap-2.5">
        {chips.map((chip) => (
          <li key={chip.href}>
            {chip.current ? (
              <span
                aria-current="page"
                className="inline-flex h-8 items-center rounded-full border-2 border-accent bg-accent px-3.5 text-sm font-bold text-white comic-shadow-sm"
              >
                {chip.label}
              </span>
            ) : (
              <Link
                href={chip.href}
                className="inline-flex h-8 items-center rounded-full border-2 border-accent bg-white px-3.5 text-sm font-bold text-accent comic-shadow-sm transition duration-150 hover:-translate-y-0.5 hover:comic-shadow active:translate-y-0.5 active:comic-shadow-none"
              >
                {chip.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
