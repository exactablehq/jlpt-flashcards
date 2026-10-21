import { notFound } from "next/navigation";
import { requireLevel } from "@/lib/routes";
import { VOCAB_CATEGORIES, getCategoryEntries, getVocabCategory } from "@/lib/vocabulary";

// Shared by the category word list and its flashcards page.

export function categoryStaticParams() {
  return VOCAB_CATEGORIES.map((category) => ({ category: category.slug }));
}

export async function resolveCategory(params: Promise<{ level: string; category: string }>) {
  const { level: levelId, category: slug } = await params;
  const level = requireLevel(levelId);
  const category = getVocabCategory(slug);
  if (!category) notFound();
  return { level, category, entries: getCategoryEntries(level.id, category) };
}
