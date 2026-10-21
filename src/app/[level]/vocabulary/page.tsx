import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";
import { comicPanel } from "@/components/ui/comic";
import { requireLevel, routes } from "@/lib/routes";
import { VOCAB_CATEGORIES, getCategoryEntries, type VocabCategory } from "@/lib/vocabulary";

export async function generateMetadata({ params }: PageProps<"/[level]/vocabulary">): Promise<Metadata> {
  const level = requireLevel((await params).level);
  return { title: `${level.label} Vocabulary` };
}

function CategoryRow({ level, category, count }: { level: string; category: VocabCategory; count: number }) {
  return (
    <div className={`${comicPanel} flex items-center justify-between gap-3 py-3.5 pr-3 pl-5`}>
      <div className="min-w-0">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-lg font-bold text-ink">{category.label}</span>
          <span lang="ja" className="text-sm font-bold text-accent">
            {category.jp}
          </span>
        </p>
        <p className="font-study text-base text-ink-muted">{count} words</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <ButtonLink
          href={routes.vocabCategory(level, category.slug)}
          variant="secondary"
          size="sm"
          aria-label={`${category.label} word list`}
        >
          List
        </ButtonLink>
        <ButtonLink
          href={routes.vocabFlashcards(level, category.slug)}
          size="sm"
          aria-label={`${category.label} flashcards`}
        >
          Flashcards
        </ButtonLink>
      </div>
    </div>
  );
}

export default async function VocabularyIndex({ params }: PageProps<"/[level]/vocabulary">) {
  const level = requireLevel((await params).level);
  const [all, ...categories] = VOCAB_CATEGORIES;
  const count = (category: VocabCategory) => getCategoryEntries(level.id, category).length;

  return (
    <div className="mx-auto w-full max-w-3xl py-8 sm:py-12">
      <PageHeader
        eyebrow="語彙"
        title="Vocabulary"
        description="Study by category. Each one has a printable word list and its own flashcard deck, and your progress is saved separately for each."
        breadcrumbs={[
          { label: "Home", href: routes.home },
          { label: level.label, href: routes.level(level.id) },
          { label: "Vocabulary" },
        ]}
      />

      <CategoryRow level={level.id} category={all} count={count(all)} />

      <h2 className="font-study mt-10 mb-4 text-center text-xl text-ink-muted">
        by category ✿
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {categories.map((category) => (
          <li key={category.slug}>
            <CategoryRow level={level.id} category={category} count={count(category)} />
          </li>
        ))}
      </ul>
    </div>
  );
}
