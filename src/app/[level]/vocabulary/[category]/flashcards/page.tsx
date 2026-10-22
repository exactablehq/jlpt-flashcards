import type { Metadata } from "next";
import { FlashcardDeck } from "@/components/flashcards/flashcard-deck";
import { PageHeader } from "@/components/layout/page-header";
import { CategoryNav } from "@/components/study/category-nav";
import { ButtonLink } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";
import { toLessonSets, toVocabCards } from "@/lib/vocabulary";
import { categoryStaticParams, resolveCategory } from "../params";

export const dynamicParams = false;
export const generateStaticParams = categoryStaticParams;

type Props = PageProps<"/[level]/vocabulary/[category]/flashcards">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { level, category, entries } = await resolveCategory(params);
  const n = entries.length;
  const isAll = category.types === "all";
  return pageMetadata({
    title: isAll
      ? `${level.label} Vocabulary Flashcards (${n} Words, Free)`
      : `${level.label} ${category.label} Flashcards (Free, No Sign-up)`,
    description: `Practise ${isAll ? `all ${n} ${level.label} words` : `${n} ${level.label} ${category.label.toLowerCase()}`} with free flashcards in shuffled sets of about 50. Tap to reveal the meaning; progress saves on your device.`,
    path: routes.vocabFlashcards(level.id, category.slug),
  });
}

export default async function CategoryFlashcards({ params }: Props) {
  const { level, category, entries } = await resolveCategory(params);
  const isAll = category.types === "all";
  const cards = toVocabCards(entries, { showType: isAll });
  // Sets of about 50 words made of whole lessons, each shuffled when opened.
  const sets = toLessonSets(entries);

  return (
    <div className="mx-auto w-full max-w-3xl py-6 sm:py-10">
      <PageHeader
        eyebrow={category.jp}
        title={`${category.label} flashcards`}
        breadcrumbs={[
          { label: "Home", href: routes.home },
          { label: level.label, href: routes.level(level.id) },
          { label: "Vocabulary", href: routes.section(level.id, "vocabulary") },
          { label: category.label, href: routes.vocabCategory(level.id, category.slug) },
          { label: "Flashcards" },
        ]}
        actions={
          <ButtonLink href={routes.vocabCategory(level.id, category.slug)} variant="secondary" size="sm">
            View word list
          </ButtonLink>
        }
      />

      <FlashcardDeck
        cards={cards}
        sets={sets}
        storageKey={`${level.id}:vocabulary:${category.slug}${isAll ? ":lessons" : ""}`}
        noun="words"
      />

      <CategoryNav level={level.id} current={category.slug} view="flashcards" />
    </div>
  );
}
