import type { Metadata } from "next";
import { requireLevel } from "@/lib/routes";
import { KanaChartPage } from "../kana-pages";

type Props = PageProps<"/[level]/hiragana">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Hiragana · ${requireLevel((await params).level).label}` };
}

export default function HiraganaPage({ params }: Props) {
  return <KanaChartPage params={params} script="hiragana" />;
}
