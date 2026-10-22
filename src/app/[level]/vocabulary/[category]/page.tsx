import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { CategoryNav } from "@/components/study/category-nav";
import { DataTable, type Column } from "@/components/study/data-table";
import { ListBuddy } from "@/components/study/list-buddy";
import { ButtonLink } from "@/components/ui/button";
import { PrintButton } from "@/components/ui/print-button";
import { routes } from "@/lib/routes";
import { VOCAB_TYPE_LABELS, describeVerbGroups, sortByType } from "@/lib/vocabulary";
import { categoryStaticParams, resolveCategory } from "./params";

export const dynamicParams = false;
export const generateStaticParams = categoryStaticParams;

type Props = PageProps<"/[level]/vocabulary/[category]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { level, category } = await resolveCategory(params);
  return { title: `${category.label} · ${level.label} Vocabulary` };
}

export default async function CategoryWordList({ params }: Props) {
  const { level, category, entries } = await resolveCategory(params);
  const isAll = category.types === "all";
  const isVerbs = category.slug === "verbs";
  const verbGroups = isVerbs ? describeVerbGroups(entries) : null;

  const columns: Column[] = [
    { key: "n", header: "#", hideOnMobile: true, className: "w-12 tabular-nums" },
    { key: "japanese", header: "Japanese", japanese: true },
    { key: "meaning", header: "Meaning" },
    ...(isAll ? [{ key: "type", header: "Type", className: "whitespace-nowrap", filterable: true }] : []),
    ...(isVerbs ? [{ key: "group", header: "Group", className: "whitespace-nowrap", filterable: true }] : []),
  ];

  // The full list is grouped by type; flashcards keep the study order (see the flashcards page).
  const listed = isAll ? sortByType(entries) : entries;
  const rows = listed.map((entry, i) => ({
    id: entry.id,
    cells: {
      n: String(i + 1),
      japanese: entry.japanese,
      meaning: entry.meaning,
      type: VOCAB_TYPE_LABELS[entry.type],
      group: entry.verbGroup ? `Group ${entry.verbGroup}` : "",
    },
  }));

  return (
    <div className="mx-auto w-full max-w-3xl py-8 sm:py-12">
      <p className="mb-4 hidden text-sm print:block">JLPTFlashcards · {level.label} Vocabulary</p>
      <PageHeader
        eyebrow={category.jp}
        title={category.label}
        description={
          <>
            {entries.length} words{verbGroups && <> ({verbGroups})</>},{" "}
            {isAll ? "grouped by type" : "in the order they were studied"}.
          </>
        }
        breadcrumbs={[
          { label: "Home", href: routes.home },
          { label: level.label, href: routes.level(level.id) },
          { label: "Vocabulary", href: routes.section(level.id, "vocabulary") },
          { label: category.label },
        ]}
        actions={
          <>
            <ButtonLink href={routes.vocabFlashcards(level.id, category.slug)}>Start flashcards</ButtonLink>
            <PrintButton />
          </>
        }
      />

      <DataTable caption={`${level.label} vocabulary: ${category.label}`} columns={columns} rows={rows} />

      <CategoryNav level={level.id} current={category.slug} view="list" />
      <ListBuddy />
    </div>
  );
}
