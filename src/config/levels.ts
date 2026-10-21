// JLPT levels the site offers. To add a level later, add an entry here and
// supply its data files; pages are generated from this list.
export const LEVELS = [
  {
    id: "n5",
    label: "JLPT N5",
    shortLabel: "N5",
    sections: ["Hiragana", "Katakana", "Vocabulary", "Kanji"],
  },
] as const;

export type JlptLevel = (typeof LEVELS)[number];
export type LevelId = JlptLevel["id"];

export function getLevel(id: string): JlptLevel | undefined {
  return LEVELS.find((level) => level.id === id);
}
