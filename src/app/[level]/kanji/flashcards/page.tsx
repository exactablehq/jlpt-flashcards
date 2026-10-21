import type { Metadata } from "next";
import { FlashcardDeck } from "@/components/flashcards/flashcard-deck";
import { StrokeOrderCredit } from "@/components/flashcards/stroke-order-credit";
import { PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { getSection } from "@/config/sections";
import { getKanji, toKanjiCards } from "@/lib/kanji";
import { requireLevel, routes } from "@/lib/routes";

type Props = PageProps<"/[level]/kanji/flashcards">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Kanji flashcards · ${requireLevel((await params).level).label}` };
}

export default async function KanjiFlashcardsPage({ params }: Props) {
  const level = requireLevel((await params).level);
  const section = getSection("kanji");

  return (
    <div className="mx-auto w-full max-w-3xl py-6 sm:py-10">
      <PageHeader
        eyebrow={section.jp}
        title="Kanji flashcards"
        breadcrumbs={[
          { label: "Home", href: routes.home },
          { label: level.label, href: routes.level(level.id) },
          { label: section.title, href: routes.section(level.id, "kanji") },
          { label: "Flashcards" },
        ]}
        actions={
          <ButtonLink href={routes.section(level.id, "kanji")} variant="secondary" size="sm">
            View kanji table
          </ButtonLink>
        }
      />

      <FlashcardDeck cards={toKanjiCards(getKanji(level.id))} storageKey={`${level.id}:kanji:all`} noun="kanji" strokeOrder />

      <StrokeOrderCredit />
    </div>
  );
}
