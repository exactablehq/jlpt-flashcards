import type { Metadata } from "next";
import { KanaChartPage, kanaChartMetadata } from "../kana-pages";

type Props = PageProps<"/[level]/katakana">;

export function generateMetadata({ params }: Props): Promise<Metadata> {
  return kanaChartMetadata(params, "katakana");
}

export default function KatakanaPage({ params }: Props) {
  return <KanaChartPage params={params} script="katakana" />;
}
