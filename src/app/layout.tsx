import type { Metadata, Viewport } from "next";
import { Klee_One, Shippori_Mincho, Zen_Maru_Gothic } from "next/font/google";
import { SiteBackground } from "@/components/layout/site-background";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import "./globals.css";

// Fonts are downloaded at build time and served from this site, so visitors
// never contact Google. Japanese glyphs load on demand per character range.
const zenMaru = Zen_Maru_Gothic({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-zen-maru",
  display: "swap",
});

// Only the weights the design uses: each extra weight adds ~120 font files to the deploy.
const mincho = Shippori_Mincho({
  weight: ["500", "600"],
  subsets: ["latin"],
  variable: "--font-mincho",
  display: "swap",
});

const klee = Klee_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-klee",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: "JLPTFlashcards",
    template: "%s · JLPTFlashcards",
  },
  description: "Free flashcards and study charts for the JLPT N5. No sign-up, no ads, no tracking.",
};

export const viewport: Viewport = {
  themeColor: "#f6f3ee",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${zenMaru.variable} ${mincho.variable} ${klee.variable} h-full antialiased`}>
      <body className="relative flex min-h-full flex-col font-sans">
        <SiteBackground />
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 sm:px-6">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
