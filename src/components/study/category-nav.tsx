import { routes } from "@/lib/routes";
import { VOCAB_CATEGORIES } from "@/lib/vocabulary";
import { ChipNav } from "./chip-nav";

/** Quick links to the other vocabulary categories, staying in the same view. */
export function CategoryNav({
  level,
  current,
  view,
}: {
  level: string;
  current: string;
  view: "list" | "flashcards";
}) {
  const href = view === "list" ? routes.vocabCategory : routes.vocabFlashcards;

  return (
    <ChipNav
      title={view === "list" ? "Other word lists" : "Other flashcard decks"}
      chips={VOCAB_CATEGORIES.map((category) => ({
        label: category.label,
        href: href(level, category.slug),
        current: category.slug === current,
      }))}
    />
  );
}
