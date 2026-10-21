import { LEVELS } from "@/config/levels";

// One set of pages per level in the levels config; any other level is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return LEVELS.map((level) => ({ level: level.id }));
}

export default function LevelLayout({ children }: LayoutProps<"/[level]">) {
  return children;
}
