"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LEVELS } from "@/config/levels";
import { SECTIONS } from "@/config/sections";
import { KANA_DECKS } from "@/lib/kana/model";
import { routes } from "@/lib/routes";
import { VOCAB_CATEGORIES } from "@/lib/vocabulary/model";

/** Every flashcard deck for a level, grouped by section, for the menu. */
function deckGroups(level: string) {
  const title = (slug: string) => SECTIONS.find((section) => section.slug === slug)!.title;
  return [
    ...(["hiragana", "katakana"] as const).map((script) => ({
      title: title(script),
      links: KANA_DECKS.map((deck) => ({ label: deck.label, href: routes.kanaFlashcards(level, script, deck.slug) })),
    })),
    {
      title: title("vocabulary"),
      links: VOCAB_CATEGORIES.map((category) => ({
        label: category.label,
        href: routes.vocabFlashcards(level, category.slug),
      })),
    },
    { title: title("kanji"), links: [{ label: "All kanji", href: routes.kanjiFlashcards(level) }] },
  ];
}

/**
 * Where "Back" goes when there is no history to return to (e.g. a page opened from a bookmark):
 * the page one level up, skipping "flashcards" folders that have no page of their own.
 */
function parentPath(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  const flashcards = parts.indexOf("flashcards");
  const up = flashcards > 0 ? parts.slice(0, flashcards) : parts.slice(0, -1);
  return up.length ? `/${up.join("/")}/` : "/";
}

const iconButton =
  "flex h-9 min-w-9 items-center justify-center gap-1.5 rounded-full border-2 border-accent bg-white text-accent comic-shadow-sm transition duration-150 hover:-translate-y-0.5 hover:comic-shadow active:translate-y-0.5 active:comic-shadow-none sm:h-10 sm:px-4";

/**
 * Top-left Back button on every page except the homepage, and a top-right
 * decks menu on flashcard pages. Phones get icon buttons and a drawer from the
 * right; larger screens get labelled buttons and a wide dropdown panel.
 */
export function HeaderNav() {
  // Routes end in "/" (trailingSlash); normalise in case the hook omits it.
  const rawPath = usePathname();
  const pathname = rawPath.endsWith("/") ? rawPath : `${rawPath}/`;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Close the menu after navigating.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  // While open: Escape or a click outside closes the menu.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
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

  if (pathname === routes.home) return null;
  const level = LEVELS.find((l) => pathname.startsWith(`/${l.id}/`)) ?? LEVELS[0];

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push(parentPath(pathname));
  }

  // The decks menu only appears on flashcard pages.
  const onFlashcards = pathname.includes("/flashcards/");

  return (
    <>
      <div className="no-print absolute top-6 left-3 z-40 sm:top-8 sm:left-6">
        <button type="button" onClick={goBack} aria-label="Go back" className={iconButton}>
          <span aria-hidden="true" className="text-lg leading-none">
            ←
          </span>
          <span className="hidden text-sm font-bold sm:inline">Back</span>
        </button>
      </div>

      {onFlashcards && (
        <div ref={rootRef} className="no-print absolute top-6 right-3 z-40 sm:top-8 sm:right-6">
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="deck-menu"
            aria-label="Flashcard decks"
            className={iconButton}
          >
            <MenuIcon />
            <span className="hidden text-sm font-bold sm:inline">Decks</span>
          </button>

          {/* Phones: dim the page behind the drawer. */}
          <div
            aria-hidden="true"
            className={`fixed inset-0 -z-10 bg-ink/25 transition-opacity duration-300 sm:hidden ${
              open ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          />

          <nav
            id="deck-menu"
            aria-label={`${level.label} flashcard decks`}
            inert={!open}
            className={`fixed inset-y-0 right-0 w-[min(18rem,85vw)] overflow-y-auto border-l-2 border-accent bg-white px-5 pt-6 pb-10 comic-shadow-lg transition duration-300 ease-out sm:absolute sm:inset-y-auto sm:top-full sm:right-0 sm:mt-3 sm:max-h-[calc(100dvh-7rem)] sm:w-[min(46rem,calc(100vw-3rem))] sm:origin-top-right sm:rounded-[1.5rem] sm:border-2 sm:p-6 ${
              open
                ? "visible translate-x-0 sm:scale-100 sm:opacity-100"
                : "invisible translate-x-full sm:translate-x-0 sm:scale-95 sm:opacity-0"
            }`}
          >
            <div className="mb-4 flex items-center justify-between sm:hidden">
              <span className="font-display text-lg font-semibold text-ink">Flashcard decks</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex size-8 items-center justify-center rounded-full text-lg text-ink-muted hover:bg-sakura-soft hover:text-ink"
              >
                ×
              </button>
            </div>
            <div className="grid gap-6 sm:grid-cols-4 sm:gap-5">
              {deckGroups(level.id).map((group) => (
                <section key={group.title}>
                  <h2 className="mb-2 text-xs font-bold tracking-wider text-accent uppercase">{group.title}</h2>
                  <ul className="space-y-0.5">
                    {group.links.map((link) => {
                      const current = pathname === link.href;
                      return (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            aria-current={current ? "page" : undefined}
                            className={`block rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-sakura-soft hover:text-ink ${
                              current ? "bg-sakura-soft font-bold text-accent" : "text-ink-muted"
                            }`}
                          >
                            {link.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
    >
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}
