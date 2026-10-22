import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { LinkCard } from "@/components/ui/card";
import { SECTIONS, type StudySection } from "@/config/sections";
import { getKana } from "@/lib/kana";
import { getKanji } from "@/lib/kanji";
import { requireLevel, routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";
import { VOCAB_CATEGORIES, getVocabulary } from "@/lib/vocabulary";

export async function generateMetadata({ params }: PageProps<"/[level]">): Promise<Metadata> {
  const level = requireLevel((await params).level);
  return pageMetadata({
    title: `${level.label} Study Guide: Kana, Vocabulary & Kanji`,
    description: `Everything for the ${level.label} in one place: hiragana and katakana charts, ${getVocabulary(level.id).length} vocabulary words by category and ${getKanji(level.id).length} kanji, each with free flashcards.`,
    path: routes.level(level.id),
  });
}

export default async function LevelDashboard({ params }: PageProps<"/[level]">) {
  const level = requireLevel((await params).level);
  // "All Vocabulary" is a view, not a category of its own.
  const categoryCount = VOCAB_CATEGORIES.length - 1;
  const counts: Record<StudySection["slug"], string> = {
    hiragana: `${getKana(level.id, "hiragana").length} characters`,
    katakana: `${getKana(level.id, "katakana").length} characters`,
    vocabulary: `${getVocabulary(level.id).length} words · ${categoryCount} categories`,
    kanji: `${getKanji(level.id).length} kanji`,
  };

  return (
    <div className="mx-auto w-full max-w-3xl py-8 sm:py-12">
      <PageHeader
        eyebrow="日本語能力試験"
        title={level.label}
        description="Choose where to begin. Each section has study charts you can print and flashcards to practise with."
        breadcrumbs={[{ label: "Home", href: routes.home }, { label: level.label }]}
      />
      {/* Equal-height rows, and each card fills its cell, so all four cards are the same size. */}
      <ul className="grid auto-rows-fr gap-4 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <li key={section.slug} className="[&>a]:h-full">
            <LinkCard
              href={routes.section(level.id, section.slug)}
              glyph={section.glyph}
              title={section.title}
              description={section.description}
              meta={counts[section.slug]}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
