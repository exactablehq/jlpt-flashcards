import { notFound } from "next/navigation";
import { getLevel, type JlptLevel } from "@/config/levels";

// Central list of site URLs (all with trailing slashes to match the static export).
export const routes = {
  home: "/",
  level: (level: string) => `/${level}/`,
  section: (level: string, section: string) => `/${level}/${section}/`,
  vocabCategory: (level: string, category: string) => `/${level}/vocabulary/${category}/`,
  vocabFlashcards: (level: string, category: string) => `/${level}/vocabulary/${category}/flashcards/`,
  kanaFlashcards: (level: string, script: string, deck: string) => `/${level}/${script}/flashcards/${deck}/`,
  kanjiFlashcards: (level: string) => `/${level}/kanji/flashcards/`,
};

/** Resolves a `[level]` route param, or shows the 404 page. */
export function requireLevel(id: string): JlptLevel {
  const level = getLevel(id);
  if (!level) notFound();
  return level;
}
