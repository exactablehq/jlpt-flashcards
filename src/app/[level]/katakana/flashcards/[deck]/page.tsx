import type { Metadata } from "next";
import { KanaFlashcardsPage, kanaDeckParams, kanaFlashcardsMetadata } from "../../../kana-pages";

export const dynamicParams = false;
export const generateStaticParams = kanaDeckParams;

type Props = PageProps<"/[level]/katakana/flashcards/[deck]">;

export function generateMetadata({ params }: Props): Promise<Metadata> {
  return kanaFlashcardsMetadata(params, "katakana");
}

export default function KatakanaFlashcardsPage({ params }: Props) {
  return <KanaFlashcardsPage params={params} script="katakana" />;
}
