import type { Metadata } from "next";
import { KanaChartPage, kanaChartMetadata } from "../kana-pages";

type Props = PageProps<"/[level]/hiragana">;

export function generateMetadata({ params }: Props): Promise<Metadata> {
  return kanaChartMetadata(params, "hiragana");
}

export default function HiraganaPage({ params }: Props) {
  return <KanaChartPage params={params} script="hiragana" />;
}
