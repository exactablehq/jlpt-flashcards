// Kana (hiragana / katakana) types, validation and chart layout. This module
// has no imports so it can be checked on its own.

export const KANA_GROUPS = ["basic", "dakuten", "handakuten"] as const;
export type KanaGroup = (typeof KANA_GROUPS)[number];

export interface KanaEntry {
  /** Derived from the character, which is unique per file: e.g. "n5-hiragana-あ". */
  id: string;
  kana: string;
  romaji: string;
  group: KanaGroup;
}

/** A flashcard deck: every character, or one group. */
export interface KanaDeck {
  slug: "all" | KanaGroup;
  label: string;
  jp: string;
}

export const KANA_DECKS: readonly KanaDeck[] = [
  { slug: "all", label: "All", jp: "すべて" },
  { slug: "basic", label: "Basic", jp: "清音" },
  { slug: "dakuten", label: "Dakuten", jp: "濁音" },
  { slug: "handakuten", label: "Handakuten", jp: "半濁音" },
];

export const KANA_GROUP_INFO: Record<KanaGroup, { title: string; jp: string; description: string }> = {
  basic: { title: "Basic", jp: "清音", description: "The core syllabary." },
  dakuten: { title: "Dakuten", jp: "濁音", description: "Voiced sounds, marked with ゛." },
  handakuten: { title: "Handakuten", jp: "半濁音", description: "“p” sounds, marked with ゜." },
};

export class KanaDataError extends Error {
  constructor(source: string, problems: string[]) {
    super(`Invalid kana data in ${source}:\n${problems.map((p) => `  - ${p}`).join("\n")}`);
    this.name = "KanaDataError";
  }
}

/**
 * Validates a kana file (an array of { japanese, reading, group }) and returns
 * entries in the original order. Throws, failing the build, if anything looks wrong.
 */
export function parseKanaFile(raw: unknown, idPrefix: string, source: string): KanaEntry[] {
  if (!Array.isArray(raw)) throw new KanaDataError(source, ["expected an array of characters"]);
  const problems: string[] = [];
  const seen = new Set<string>();
  const entries: KanaEntry[] = [];

  raw.forEach((item: unknown, index: number) => {
    const e = (item ?? {}) as Record<string, unknown>;
    const where = `entry #${index + 1}`;
    const kana = typeof e.japanese === "string" ? e.japanese.trim() : "";
    const romaji = typeof e.reading === "string" ? e.reading.trim() : "";
    if (!kana) problems.push(`${where}: missing japanese`);
    else if (seen.has(kana)) problems.push(`${where}: duplicate character ${kana}`);
    if (!romaji) problems.push(`${where}: missing reading`);
    if (!KANA_GROUPS.includes(e.group as KanaGroup)) problems.push(`${where}: unknown group ${JSON.stringify(e.group)}`);
    if (kana && romaji && !seen.has(kana) && KANA_GROUPS.includes(e.group as KanaGroup)) {
      seen.add(kana);
      entries.push({ id: `${idPrefix}-${kana}`, kana, romaji, group: e.group as KanaGroup });
    }
  });

  if (problems.length > 0) throw new KanaDataError(source, problems);
  return entries;
}

const VOWELS = ["a", "i", "u", "e", "o"] as const;
export const CHART_COLUMNS = VOWELS;

/** One chart row: five cells (a i u e o), empty where the row has no character. */
export type ChartRow = (KanaEntry | null)[];

/**
 * Lays characters out in the conventional chart: one row per consonant, with
 * columns a i u e o. Rows follow the file's order; each character's column
 * comes from the vowel its romaji ends in, and a new row starts whenever the
 * vowel wraps back round (e.g. after こ "ko" comes さ "sa"). ん, which has no
 * vowel, gets a row of its own.
 */
export function buildChart(entries: readonly KanaEntry[]): ChartRow[] {
  const rows: ChartRow[] = [];
  let current: ChartRow | null = null;
  let lastColumn = -1;

  for (const entry of entries) {
    const column = VOWELS.indexOf(entry.romaji.at(-1) as (typeof VOWELS)[number]);
    if (column === -1) {
      rows.push([entry, null, null, null, null]);
      current = null;
      lastColumn = -1;
      continue;
    }
    if (!current || column <= lastColumn) {
      current = [null, null, null, null, null];
      rows.push(current);
    }
    current[column] = entry;
    lastColumn = column;
  }
  return rows;
}
