import type { CSSProperties } from "react";
import { withBasePath } from "@/lib/paths";

/** Fixed watercolor backdrop behind every page. Hidden when printing. */
export function SiteBackground() {
  const style = {
    "--bg-image": `url("${withBasePath("/images/backgrounds/sakura_bg.webp")}")`,
  } as CSSProperties;

  return <div aria-hidden="true" className="site-bg fixed inset-0 -z-10" style={style} />;
}
