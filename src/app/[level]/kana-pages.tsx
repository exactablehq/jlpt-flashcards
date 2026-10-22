import { notFound } from "next/navigation";
import { FlashcardDeck } from "@/components/flashcards/flashcard-deck";
import { StrokeOrderCredit } from "@/components/flashcards/stroke-order-credit";
import { PageHeader } from "@/components/layout/page-header";
import { ChipNav } from "@/components/study/chip-nav";
import { KanaChart } from "@/components/study/kana-chart";
import { ListBuddy } from "@/components/study/list-buddy";
import { ButtonLink } from "@/components/ui/button";
import { PrintButton } from "@/components/ui/print-button";
import { getSection } from "@/config/sections";
import {
  KANA_DECKS,
  KANA_GROUPS,
  KANA_GROUP_INFO,
  buildChart,
  getDeckEntries,
  getKana,
  getKanaDeck,
  toKanaCards,
  type KanaScript,
} from "@/lib/kana";
import { requireLevel, routes } from "@/lib/routes";

// Shared by the Hiragana and Katakana routes, which differ only in `script`.

export const kanaDeckParams = () => KANA_DECKS.map((deck) => ({ deck: deck.slug }));

function crumbs(levelId: string, levelLabel: string) {
  return [
    { label: "Home", href: routes.home },
    { label: levelLabel, href: routes.level(levelId) },
  ];
}

/** The chart page: every group as a chart, printable, with a flashcard deck per group. */
export async function KanaChartPage({ params, script }: { params: Promise<{ level: string }>; script: KanaScript }) {
  const level = requireLevel((await params).level);
  const section = getSection(script);
  const entries = getKana(level.id, script);

  return (
    <div className="mx-auto w-full max-w-3xl py-8 sm:py-12">
      <p className="mb-4 hidden text-sm print:block">JLPTFlashcards · {level.label}</p>
      <PageHeader
        eyebrow={section.jp}
        title={section.title}
        description={`${entries.length} characters, in the traditional chart order.`}
        breadcrumbs={[...crumbs(level.id, level.label), { label: section.title }]}
        actions={
          <>
            <ButtonLink href={routes.kanaFlashcards(level.id, script, "all")}>Start flashcards</ButtonLink>
            <PrintButton />
          </>
        }
      />

      <div className="flex flex-col gap-10 print:gap-6">
        {KANA_GROUPS.map((group) => {
          const groupEntries = entries.filter((entry) => entry.group === group);
          if (groupEntries.length === 0) return null;
          const info = KANA_GROUP_INFO[group];
          return (
            <section key={group} aria-labelledby={`${group}-heading`} className="break-inside-avoid">
              <div className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2 px-1">
                <div>
                  <h2 id={`${group}-heading`} className="text-xl font-bold text-ink">
                    {info.title}{" "}
                    <span lang="ja" className="text-sm font-bold text-accent">
                      {info.jp}
                    </span>
                  </h2>
                  <p className="font-study text-base text-ink-muted">
                    {groupEntries.length} characters · {info.description}
                  </p>
                </div>
                <ButtonLink
                  href={routes.kanaFlashcards(level.id, script, group)}
                  variant="secondary"
                  size="sm"
                  className="no-print"
                  aria-label={`${info.title} ${section.title.toLowerCase()} flashcards`}
                >
                  Flashcards →
                </ButtonLink>
              </div>
              <KanaChart
                caption={`${section.title}: ${info.title}`}
                rows={buildChart(groupEntries)}
                note={`${section.title} · ${info.title}`}
              />
            </section>
          );
        })}
      </div>

      <ListBuddy />
    </div>
  );
}

/** A flashcard deck for one group (or all) of a script. */
export async function KanaFlashcardsPage({
  params,
  script,
}: {
  params: Promise<{ level: string; deck: string }>;
  script: KanaScript;
}) {
  const { level: levelId, deck: deckSlug } = await params;
  const level = requireLevel(levelId);
  const deck = getKanaDeck(deckSlug);
  if (!deck) notFound();
  const section = getSection(script);
  const entries = getDeckEntries(level.id, script, deck);
  const title = deck.slug === "all" ? `${section.title} flashcards` : `${deck.label} ${section.title.toLowerCase()}`;

  return (
    <div className="mx-auto w-full max-w-3xl py-6 sm:py-10">
      <PageHeader
        eyebrow={deck.slug === "all" ? section.jp : deck.jp}
        title={title}
        breadcrumbs={[
          ...crumbs(level.id, level.label),
          { label: section.title, href: routes.section(level.id, script) },
          { label: deck.slug === "all" ? "Flashcards" : `${deck.label} flashcards` },
        ]}
        actions={
          <ButtonLink href={routes.section(level.id, script)} variant="secondary" size="sm">
            View chart
          </ButtonLink>
        }
      />

      <FlashcardDeck
        cards={toKanaCards(entries, { showGroup: deck.slug === "all" })}
        storageKey={`${level.id}:${script}:${deck.slug}`}
        noun="characters"
        strokeOrder
      />

      <ChipNav
        title="Other decks"
        chips={KANA_DECKS.map((d) => ({
          label: `${d.label} (${getDeckEntries(level.id, script, d).length})`,
          href: routes.kanaFlashcards(level.id, script, d.slug),
          current: d.slug === deck.slug,
        }))}
      />

      <StrokeOrderCredit />
    </div>
  );
}
