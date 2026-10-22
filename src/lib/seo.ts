import type { Metadata } from "next";

// The live site's address. Canonical URLs, the sitemap and social previews are built from it.
export const SITE_URL = "https://jlptflashcards.com";
export const SITE_NAME = "JLPTFlashcards";

/** Preview image for shared links: a 1200×630 PNG in public/. */
export const SOCIAL_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "JLPTFlashcards: free JLPT N5 flashcards and study lists",
};

/**
 * Title, description, canonical URL and social-sharing tags for one page.
 * Titles are used as-is (no brand suffix) so the search phrase fits in ~60 characters.
 * Every page shares the same social preview image.
 */
export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      type: "website",
      locale: "en",
      images: [SOCIAL_IMAGE],
    },
    twitter: { card: "summary_large_image", title, description, images: [SOCIAL_IMAGE] },
  };
}
