/**
 * A card in any deck (vocabulary, kana, kanji). Plain data so it can be
 * prepared at build time and passed to the client-side deck.
 */
export interface DeckCard {
  /** Stable ID from the source data; used to track progress. */
  id: string;
  /** Shown on the front, e.g. a word, kana or kanji. */
  front: string;
  /** Main answer on the back, e.g. the English meaning or romaji. */
  back: string;
  /** Short tag on the back, e.g. "Group 1 verb". */
  note?: string;
  /** Extra labelled lines on the back, e.g. kanji readings. */
  details?: { label: string; value: string }[];
}
