import type { LevelId } from "@/config/levels";
import type { DeckCard } from "@/lib/flashcards/types";
import n5Kanji from "@data/N5_kanji.json";
import { formatReadings, parseKanjiFile, reorderByPositions, type KanjiEntry } from "./model";

export * from "./model";

/**
 * Study order for N5, as positions in data/N5_kanji.json: numbers (11–25) first,
 * then nature (1–10), position words (26–30) and directions (51–60); the rest
 * follow in file order. The JSON file itself is left unchanged.
 */
const N5_KANJI_ORDER = [
  [11, 25],
  [1, 10],
  [26, 30],
  [51, 60],
] as const;

// Parsed once at build time. Invalid data fails the build with a clear message.
const KANJI_BY_LEVEL: Record<LevelId, KanjiEntry[]> = {
  n5: reorderByPositions(parseKanjiFile(n5Kanji, "n5-kanji", "data/N5_kanji.json"), N5_KANJI_ORDER),
};

export function getKanji(level: LevelId): readonly KanjiEntry[] {
  return KANJI_BY_LEVEL[level];
}

/** Kanji on the front; meaning and readings on the back. */
export function toKanjiCards(entries: readonly KanjiEntry[]): DeckCard[] {
  return entries.map((entry) => ({
    id: entry.id,
    front: entry.kanji,
    back: entry.meaning,
    details: [
      { label: "On'yomi", value: formatReadings(entry.onyomi) },
      { label: "Kun'yomi", value: formatReadings(entry.kunyomi) },
    ],
  }));
}
