import type { Metadata } from "next";
import { requireLevel } from "@/lib/routes";
import { KanaChartPage } from "../kana-pages";

type Props = PageProps<"/[level]/katakana">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Katakana · ${requireLevel((await params).level).label}` };
}

export default function KatakanaPage({ params }: Props) {
  return <KanaChartPage params={params} script="katakana" />;
}
