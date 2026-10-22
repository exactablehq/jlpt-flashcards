import type { Metadata, Viewport } from "next";
import { Klee_One, Shippori_Mincho, Zen_Maru_Gothic } from "next/font/google";
import { SiteBackground } from "@/components/layout/site-background";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SITE_NAME, SITE_URL, SOCIAL_IMAGE } from "@/lib/seo";
import "./globals.css";

// Fonts are downloaded at build time and served from this site, so visitors
// never contact Google. Japanese glyphs load on demand per character range.
// Japanese fonts are split into hundreds of character-range files. Preloading
// would make every page fetch all of them (~7.6 MB); without it the browser
// downloads only the ranges the page actually uses.
const zenMaru = Zen_Maru_Gothic({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-zen-maru",
  display: "swap",
  preload: false,
});

// Only the weights the design uses: each extra weight adds ~120 font files to the deploy.
const mincho = Shippori_Mincho({
  weight: ["500", "600"],
  subsets: ["latin"],
  variable: "--font-mincho",
  display: "swap",
  preload: false,
});

const klee = Klee_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-klee",
  display: "swap",
  preload: false,
});

// Defaults for every page; each page sets its own title, description and canonical URL (see lib/seo.ts).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: "Free flashcards and study charts for the JLPT N5. No sign-up, no ads, no tracking.",
  applicationName: SITE_NAME,
  openGraph: { siteName: SITE_NAME, type: "website", locale: "en", images: [SOCIAL_IMAGE] },
  twitter: { card: "summary_large_image", images: [SOCIAL_IMAGE] },
};

export const viewport: Viewport = {
  themeColor: "#f6f3ee",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${zenMaru.variable} ${mincho.variable} ${klee.variable} h-full antialiased`}>
      <body className="relative flex min-h-dvh flex-col font-sans">
        <SiteBackground />
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 sm:px-6">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
