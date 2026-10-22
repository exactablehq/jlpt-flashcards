import type { LevelId } from "@/config/levels";
import { packGroups } from "@/lib/flashcards/batching";
import type { DeckCard } from "@/lib/flashcards/types";
import n5Vocab from "@data/N5_vocab.json";
import {
  VOCAB_CATEGORIES,
  VOCAB_TYPE_LABELS,
  filterByCategory,
  parseVocabFile,
  type VocabCategory,
  type VocabEntry,
} from "./model";

export * from "./model";

// Parsed once at build time. Invalid data fails the build with a clear message.
const VOCAB_BY_LEVEL: Record<LevelId, VocabEntry[]> = {
  n5: parseVocabFile(n5Vocab, "N5", "data/N5_vocab.json"),
};

export function getVocabulary(level: LevelId): readonly VocabEntry[] {
  return VOCAB_BY_LEVEL[level];
}

export function getVocabCategory(slug: string): VocabCategory | undefined {
  return VOCAB_CATEGORIES.find((category) => category.slug === slug);
}

export function getCategoryEntries(level: LevelId, category: VocabCategory): VocabEntry[] {
  return filterByCategory(getVocabulary(level), category);
}

/** e.g. "79 Group 1 · 44 Group 2 · 24 Group 3" for a list containing verbs. */
export function describeVerbGroups(entries: readonly VocabEntry[]): string | null {
  const counts = [1, 2, 3].map((group) => entries.filter((entry) => entry.verbGroup === group).length);
  if (counts.every((count) => count === 0)) return null;
  return counts.map((count, i) => `${count} Group ${i + 1}`).join(" · ");
}

/**
 * Flashcards: Japanese on the front, meaning on the back. Verbs always show
 * their group; the mixed "All Vocabulary" deck also shows each word's type.
 */
export function toVocabCards(entries: readonly VocabEntry[], { showType }: { showType: boolean }): DeckCard[] {
  return entries.map((entry) => ({
    id: entry.id,
    front: entry.japanese,
    back: entry.meaning,
    note: showType
      ? VOCAB_TYPE_LABELS[entry.type]
      : entry.verbGroup
        ? `Group ${entry.verbGroup} verb`
        : undefined,
  }));
}

/** Flashcard sets of about 50 words, made of whole lessons in study order. */
export function toLessonSets(entries: readonly VocabEntry[]): string[][] {
  const lessons: string[][] = [];
  entries.forEach((entry, i) => {
    if (i === 0 || entry.lesson !== entries[i - 1].lesson) lessons.push([]);
    lessons[lessons.length - 1].push(entry.id);
  });
  return packGroups(lessons);
}
