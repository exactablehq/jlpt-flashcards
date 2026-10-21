// Vocabulary types, categories and validation. This module has no imports so
// it can be checked on its own, independent of the UI and the bundler.

export const VOCAB_TYPES = [
  "Noun",
  "Pronoun",
  "Verb (Group 1)",
  "Verb (Group 2)",
  "Verb (Group 3)",
  "Adverb",
  "Question word",
  "Adjective (な)",
  "Adjective (い)",
  "Adjective",
  "Counter",
  "Expression",
  "Particle",
  "Conjunction",
] as const;

export type VocabType = (typeof VOCAB_TYPES)[number];
export type VerbGroup = 1 | 2 | 3;

/** A learner-facing entry. Source-book and spreadsheet metadata are dropped. */
export interface VocabEntry {
  id: string;
  japanese: string;
  meaning: string;
  type: VocabType;
  verbGroup: VerbGroup | null;
}

export interface VocabCategory {
  slug: string;
  label: string;
  /** Japanese name of the category, shown as a small accent label. */
  jp: string;
  /** JSON `type` values included in this category, or "all". */
  types: readonly VocabType[] | "all";
}

export const VOCAB_CATEGORIES: readonly VocabCategory[] = [
  { slug: "all", label: "All Vocabulary", jp: "すべて", types: "all" },
  { slug: "nouns", label: "Nouns", jp: "名詞", types: ["Noun"] },
  { slug: "pronouns", label: "Pronouns", jp: "代名詞", types: ["Pronoun"] },
  { slug: "verbs", label: "Verbs", jp: "動詞", types: ["Verb (Group 1)", "Verb (Group 2)", "Verb (Group 3)"] },
  { slug: "adverbs", label: "Adverbs", jp: "副詞", types: ["Adverb"] },
  { slug: "question-words", label: "Question Words", jp: "疑問詞", types: ["Question word"] },
  { slug: "na-adjectives", label: "な-Adjectives", jp: "な形容詞", types: ["Adjective (な)"] },
  { slug: "i-adjectives", label: "い-Adjectives", jp: "い形容詞", types: ["Adjective (い)"] },
  { slug: "other-adjectives", label: "Other Adjectives", jp: "その他", types: ["Adjective"] },
  { slug: "counters", label: "Counters", jp: "助数詞", types: ["Counter"] },
  { slug: "expressions", label: "Expressions", jp: "表現", types: ["Expression"] },
  { slug: "particles", label: "Particles", jp: "助詞", types: ["Particle"] },
  { slug: "conjunctions", label: "Conjunctions", jp: "接続詞", types: ["Conjunction"] },
];

/** Learner-facing names for each JSON `type`. */
export const VOCAB_TYPE_LABELS: Record<VocabType, string> = {
  Noun: "Noun",
  Pronoun: "Pronoun",
  "Verb (Group 1)": "Verb · Group 1",
  "Verb (Group 2)": "Verb · Group 2",
  "Verb (Group 3)": "Verb · Group 3",
  Adverb: "Adverb",
  "Question word": "Question word",
  "Adjective (な)": "な-adjective",
  "Adjective (い)": "い-adjective",
  Adjective: "Other adjective",
  Counter: "Counter",
  Expression: "Expression",
  Particle: "Particle",
  Conjunction: "Conjunction",
};

const VERB_GROUP_BY_TYPE: Partial<Record<VocabType, VerbGroup>> = {
  "Verb (Group 1)": 1,
  "Verb (Group 2)": 2,
  "Verb (Group 3)": 3,
};

export class VocabDataError extends Error {
  constructor(source: string, problems: string[]) {
    const shown = problems.slice(0, 20).map((p) => `  - ${p}`).join("\n");
    const more = problems.length > 20 ? `\n  …and ${problems.length - 20} more` : "";
    super(`Invalid vocabulary data in ${source}:\n${shown}${more}`);
    this.name = "VocabDataError";
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim() !== "";
}

/**
 * Validates a raw vocabulary file and converts it to learner-facing entries,
 * keeping the original order. Throws (failing the build) instead of silently
 * dropping or altering anything that looks wrong.
 */
export function parseVocabFile(raw: unknown, expectedLevel: string, source: string): VocabEntry[] {
  const problems: string[] = [];
  const file = raw as {
    level?: unknown;
    total_entries?: unknown;
    categories?: unknown;
    entries?: unknown;
  } | null;

  if (!file || !Array.isArray(file.entries)) {
    throw new VocabDataError(source, ["expected an object with an `entries` array"]);
  }
  if (file.level !== expectedLevel) {
    problems.push(`level is ${JSON.stringify(file.level)}, expected "${expectedLevel}"`);
  }

  const seenIds = new Set<string>();
  const typeCounts = new Map<string, number>();
  const entries: VocabEntry[] = [];

  file.entries.forEach((item: unknown, index: number) => {
    const e = (item ?? {}) as Record<string, unknown>;
    const where = isNonEmptyString(e.id) ? e.id : `entry #${index + 1}`;
    let ok = true;

    if (!isNonEmptyString(e.id)) {
      problems.push(`${where}: missing id`);
      ok = false;
    } else if (seenIds.has(e.id)) {
      problems.push(`${where}: duplicate id`);
      ok = false;
    } else {
      seenIds.add(e.id);
    }
    if (!isNonEmptyString(e.japanese)) {
      problems.push(`${where}: missing japanese`);
      ok = false;
    }
    if (!isNonEmptyString(e.meaning)) {
      problems.push(`${where}: missing meaning`);
      ok = false;
    }
    if (!VOCAB_TYPES.includes(e.type as VocabType)) {
      problems.push(`${where}: unknown type ${JSON.stringify(e.type)}`);
      ok = false;
    } else {
      const type = e.type as VocabType;
      typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
      const expectedGroup = VERB_GROUP_BY_TYPE[type] ?? null;
      if (e.verb_group !== expectedGroup) {
        problems.push(
          `${where}: verb_group is ${JSON.stringify(e.verb_group)} but type "${type}" implies ${expectedGroup}`,
        );
        ok = false;
      }
    }

    if (ok) {
      entries.push({
        id: e.id as string,
        japanese: e.japanese as string,
        meaning: e.meaning as string,
        type: e.type as VocabType,
        verbGroup: (e.verb_group as VerbGroup | null) ?? null,
      });
    }
  });

  if (file.total_entries !== file.entries.length) {
    problems.push(`total_entries is ${file.total_entries} but file has ${file.entries.length} entries`);
  }
  if (file.categories && typeof file.categories === "object") {
    for (const [type, count] of Object.entries(file.categories as Record<string, unknown>)) {
      const actual = typeCounts.get(type) ?? 0;
      if (actual !== count) {
        problems.push(`categories["${type}"] says ${count} but file has ${actual}`);
      }
    }
  }

  if (problems.length > 0) {
    throw new VocabDataError(source, problems);
  }
  return entries;
}

export function filterByCategory(entries: readonly VocabEntry[], category: VocabCategory): VocabEntry[] {
  const { types } = category;
  if (types === "all") return [...entries];
  return entries.filter((entry) => types.includes(entry.type));
}
