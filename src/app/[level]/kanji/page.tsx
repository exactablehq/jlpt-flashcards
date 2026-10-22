import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { DataTable, type Column } from "@/components/study/data-table";
import { DictionaryCredit } from "@/components/study/dictionary-credit";
import { ListBuddy } from "@/components/study/list-buddy";
import { ButtonLink } from "@/components/ui/button";
import { PrintButton } from "@/components/ui/print-button";
import { getSection } from "@/config/sections";
import { formatReadings, getKanji } from "@/lib/kanji";
import { requireLevel, routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo";

type Props = PageProps<"/[level]/kanji">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const level = requireLevel((await params).level);
  const count = getKanji(level.id).length;
  return pageMetadata({
    title: `${level.label} Kanji List (${count}) with Readings & Stroke Order`,
    description: `All ${count} ${level.label} kanji with meanings, on'yomi and kun'yomi readings, and animated stroke order. Free printable list and flashcards.`,
    path: routes.section(level.id, "kanji"),
  });
}

const columns: Column[] = [
  { key: "n", header: "#", hideOnMobile: true, className: "w-12 tabular-nums" },
  { key: "kanji", header: "Kanji", japanese: true, large: true, className: "w-20" },
  { key: "meaning", header: "Meaning" },
  { key: "onyomi", header: "On'yomi", japanese: true },
  { key: "kunyomi", header: "Kun'yomi", japanese: true },
];

export default async function KanjiPage({ params }: Props) {
  const level = requireLevel((await params).level);
  const section = getSection("kanji");
  const entries = getKanji(level.id);

  const rows = entries.map((entry, i) => ({
    id: entry.id,
    cells: {
      n: String(i + 1),
      kanji: entry.kanji,
      meaning: entry.meaning,
      onyomi: formatReadings(entry.onyomi),
      kunyomi: formatReadings(entry.kunyomi),
    },
  }));

  // Pop-up data card for each kanji, opened by clicking its row.
  const details = Object.fromEntries(
    entries.map((entry) => [
      entry.id,
      {
        character: entry.kanji,
        primary: entry.meaning,
        details: [
          { label: "On'yomi", value: formatReadings(entry.onyomi) },
          { label: "Kun'yomi", value: formatReadings(entry.kunyomi) },
        ],
      },
    ]),
  );

  return (
    <div className="mx-auto w-full max-w-3xl py-8 sm:py-12">
      <p className="mb-4 hidden text-sm print:block">JLPTFlashcards · {level.label} Kanji</p>
      <PageHeader
        eyebrow={section.jp}
        title={section.title}
        description={`${entries.length} kanji, in the order they were studied. On'yomi are shown in katakana, kun'yomi in hiragana.`}
        breadcrumbs={[
          { label: "Home", href: routes.home },
          { label: level.label, href: routes.level(level.id) },
          { label: section.title },
        ]}
        actions={
          <>
            <ButtonLink href={routes.kanjiFlashcards(level.id)}>Start flashcards</ButtonLink>
            <PrintButton />
          </>
        }
      />

      <DataTable caption={`${level.label} kanji`} columns={columns} rows={rows} details={details} centerRows />
      <DictionaryCredit source="KANJIDIC2" />
      <ListBuddy />
    </div>
  );
}
