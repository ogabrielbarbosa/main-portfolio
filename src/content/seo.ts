import type { Metadata } from "next";
import type { Locale } from "./types";

export const SITE_URL = "https://www.ogabarbosa.com";
export const SITE_NAME = "Gabriel Barbosa";

// Share card (public/og.png), used by every page.
const OG_IMAGE = { url: "/og.png", width: 1200, height: 630, alt: "Gabriel Barbosa — AI Engineer & Product Builder" };

const OG_LOCALE: Record<Locale, string> = { pt: "pt_BR", en: "en_US" };

// The same page in both languages: `{ pt: "/about", en: "/en/about" }`.
export type PagePaths = Record<Locale, string>;

export const absolute = (path: string) => new URL(path, SITE_URL).toString();

/**
 * Full metadata for one page: canonical URL, hreflang pair, Open Graph and Twitter card.
 * Next merges metadata shallowly, so each page passes everything here instead of leaning on the layout.
 */
export function pageMetadata({
  locale,
  paths,
  title,
  description,
  type = "website",
}: {
  locale: Locale;
  paths: PagePaths;
  title: string;
  description: string;
  type?: "website" | "article" | "profile";
}): Metadata {
  const url = paths[locale];
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: { "pt-BR": paths.pt, en: paths.en, "x-default": paths.pt },
    },
    openGraph: {
      type,
      url,
      siteName: SITE_NAME,
      title,
      description,
      locale: OG_LOCALE[locale],
      alternateLocale: OG_LOCALE[locale === "pt" ? "en" : "pt"],
      images: [OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
  };
}

// Shared by both root layouts.
export const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  formatDetection: { telephone: false, email: false, address: false },
};
