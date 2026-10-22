// The four study sections of a level, in the order they appear on the dashboard.
export interface StudySection {
  slug: "hiragana" | "katakana" | "vocabulary" | "kanji";
  title: string;
  jp: string;
  /** Large character shown on the section's card. */
  glyph: string;
  description: string;
}

export const SECTIONS: readonly StudySection[] = [
  {
    slug: "hiragana",
    title: "Hiragana",
    jp: "ひらがな",
    glyph: "あ",
    description: "The basic Japanese syllabary.",
  },
  {
    slug: "katakana",
    title: "Katakana",
    jp: "カタカナ",
    glyph: "ア",
    description: "The syllabary for loanwords and names.",
  },
  {
    slug: "vocabulary",
    title: "Vocabulary",
    jp: "語彙",
    glyph: "語",
    description: "Word lists and flashcards, organised by category.",
  },
  {
    slug: "kanji",
    title: "Kanji",
    jp: "漢字",
    glyph: "漢",
    description: "Meanings, readings and stroke order.",
  },
];

export function getSection(slug: StudySection["slug"]): StudySection {
  return SECTIONS.find((section) => section.slug === slug)!;
}
