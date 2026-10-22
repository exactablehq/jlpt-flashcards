import type { MetadataRoute } from "next";
import { LEVELS } from "@/config/levels";
import { KANA_DECKS } from "@/lib/kana";
import { routes } from "@/lib/routes";
import { SITE_URL } from "@/lib/seo";
import { VOCAB_CATEGORIES } from "@/lib/vocabulary";

// Static export: generated once at build time.
export const dynamic = "force-static";

/** Every page of the site, built from the same lists that generate the pages. */
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    routes.home,
    ...LEVELS.flatMap((level) => [
      routes.level(level.id),
      ...(["hiragana", "katakana"] as const).flatMap((script) => [
        routes.section(level.id, script),
        ...KANA_DECKS.map((deck) => routes.kanaFlashcards(level.id, script, deck.slug)),
      ]),
      routes.section(level.id, "vocabulary"),
      ...VOCAB_CATEGORIES.flatMap((category) => [
        routes.vocabCategory(level.id, category.slug),
        routes.vocabFlashcards(level.id, category.slug),
      ]),
      routes.section(level.id, "kanji"),
      routes.kanjiFlashcards(level.id),
    ]),
  ];
  return paths.map((path) => ({ url: `${SITE_URL}${path}` }));
}
