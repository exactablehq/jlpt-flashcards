import type { Metadata } from "next";
import { getKanaDeck } from "@/lib/kana";
import { requireLevel } from "@/lib/routes";
import { KanaFlashcardsPage, kanaDeckParams } from "../../../kana-pages";

export const dynamicParams = false;
export const generateStaticParams = kanaDeckParams;

type Props = PageProps<"/[level]/katakana/flashcards/[deck]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { level, deck } = await params;
  const label = getKanaDeck(deck)?.label ?? "";
  return { title: `Katakana flashcards${label && label !== "All" ? ` · ${label}` : ""} · ${requireLevel(level).label}` };
}

export default function KatakanaFlashcardsPage({ params }: Props) {
  return <KanaFlashcardsPage params={params} script="katakana" />;
}
