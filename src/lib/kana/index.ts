import type { LevelId } from "@/config/levels";
import type { DeckCard } from "@/lib/flashcards/types";
import n5Hiragana from "@data/N5_hiragana.json";
import n5Katakana from "@data/N5_katakana.json";
import { KANA_DECKS, KANA_GROUP_INFO, parseKanaFile, type KanaDeck, type KanaEntry } from "./model";

export * from "./model";

export type KanaScript = "hiragana" | "katakana";

// Parsed once at build time. Invalid data fails the build with a clear message.
const KANA_BY_LEVEL: Record<LevelId, Record<KanaScript, KanaEntry[]>> = {
  n5: {
    hiragana: parseKanaFile(n5Hiragana, "n5-hiragana", "data/N5_hiragana.json"),
    katakana: parseKanaFile(n5Katakana, "n5-katakana", "data/N5_katakana.json"),
  },
};

export function getKana(level: LevelId, script: KanaScript): readonly KanaEntry[] {
  return KANA_BY_LEVEL[level][script];
}

export function getKanaDeck(slug: string): KanaDeck | undefined {
  return KANA_DECKS.find((deck) => deck.slug === slug);
}

export function getDeckEntries(level: LevelId, script: KanaScript, deck: KanaDeck): KanaEntry[] {
  const entries = getKana(level, script);
  return deck.slug === "all" ? [...entries] : entries.filter((entry) => entry.group === deck.slug);
}

/** Character on the front, romaji on the back. The mixed "All" deck also notes the group. */
export function toKanaCards(entries: readonly KanaEntry[], { showGroup }: { showGroup: boolean }): DeckCard[] {
  return entries.map((entry) => ({
    id: entry.id,
    front: entry.kana,
    back: entry.romaji,
    note: showGroup && entry.group !== "basic" ? KANA_GROUP_INFO[entry.group].title : undefined,
  }));
}
