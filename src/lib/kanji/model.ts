// Kanji types and validation. This module has no imports so it can be checked on its own.

export interface KanjiEntry {
  /** Derived from the character, which is unique per file: e.g. "n5-kanji-山". */
  id: string;
  kanji: string;
  meaning: string;
  /** Empty when the source has "-" or "—" (no reading of that kind). */
  onyomi: string[];
  kunyomi: string[];
}

export class KanjiDataError extends Error {
  constructor(source: string, problems: string[]) {
    super(`Invalid kanji data in ${source}:\n${problems.map((p) => `  - ${p}`).join("\n")}`);
    this.name = "KanjiDataError";
  }
}

/** "ニチ、ニ、 ジツ" → ["ニチ", "ニ", "ジツ"]; "-", "–" or "—" → []. Display formatting only. */
function splitReadings(value: string): string[] {
  if (["-", "–", "—"].includes(value.trim())) return [];
  return value
    .split("、")
    .map((reading) => reading.trim())
    .filter(Boolean);
}

/**
 * Validates a kanji file (an array of { kanji, meaning, onyomi, kunyomi, ... })
 * and returns entries in the original order. Lesson numbers are not carried over.
 * Throws, failing the build, if anything looks wrong.
 */
export function parseKanjiFile(raw: unknown, idPrefix: string, source: string): KanjiEntry[] {
  if (!Array.isArray(raw)) throw new KanjiDataError(source, ["expected an array of kanji"]);
  const problems: string[] = [];
  const seen = new Set<string>();
  const entries: KanjiEntry[] = [];

  raw.forEach((item: unknown, index: number) => {
    const e = (item ?? {}) as Record<string, unknown>;
    const kanji = typeof e.kanji === "string" ? e.kanji.trim() : "";
    const where = kanji || `entry #${index + 1}`;
    const fields = ["meaning", "onyomi", "kunyomi"] as const;
    const missing = fields.filter((field) => typeof e[field] !== "string" || !(e[field] as string).trim());

    if ([...kanji].length !== 1) problems.push(`${where}: expected a single kanji character`);
    else if (seen.has(kanji)) problems.push(`${where}: duplicate kanji`);
    for (const field of missing) problems.push(`${where}: missing ${field}`);

    if ([...kanji].length === 1 && !seen.has(kanji) && missing.length === 0) {
      seen.add(kanji);
      entries.push({
        id: `${idPrefix}-${kanji}`,
        kanji,
        meaning: (e.meaning as string).trim(),
        onyomi: splitReadings(e.onyomi as string),
        kunyomi: splitReadings(e.kunyomi as string),
      });
    }
  });

  if (problems.length > 0) throw new KanjiDataError(source, problems);
  return entries;
}

/**
 * Moves the given ranges of original positions (1-based, inclusive) to the
 * front, in the order listed; everything else follows in its original order.
 * Throws if a range is out of bounds or overlaps another, so no kanji is lost
 * or repeated.
 */
export function reorderByPositions<T>(entries: readonly T[], leading: readonly (readonly [number, number])[]): T[] {
  const taken = new Set<number>();
  const front: T[] = [];
  for (const [from, to] of leading) {
    if (from < 1 || to > entries.length || from > to) {
      throw new Error(`Kanji order: range ${from}–${to} is outside 1–${entries.length}`);
    }
    for (let position = from; position <= to; position++) {
      if (taken.has(position)) throw new Error(`Kanji order: position ${position} appears in more than one range`);
      taken.add(position);
      front.push(entries[position - 1]);
    }
  }
  return [...front, ...entries.filter((_, i) => !taken.has(i + 1))];
}

/** Readings for display: "サン", "ひ、び", or "—" when there are none. */
export function formatReadings(readings: readonly string[]): string {
  return readings.length > 0 ? readings.join("、") : "—";
}
