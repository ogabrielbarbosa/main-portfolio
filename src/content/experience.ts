import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { compileMDX } from "next-mdx-remote/rsc";
import type { Locale } from "./types";

// One page per job (one folder per company): content/experience/<slug>/<locale>.mdx.
// Results and photos live in the frontmatter, the story in the MDX body.
const EXPERIENCE_DIR = path.join(process.cwd(), "content/experience");

export interface ExperiencePhoto {
  src: string; // /experience/<slug>/<file> (files in public/experience/<slug>/)
  alt: string;
  caption?: string;
}

export interface ExperienceFrontmatter {
  slug: string;
  locale: Locale;
  status: "draft" | "published";
  company: string;
  companyHref?: string;
  role: string;
  period: { start: string; end?: string };
  where: string; // "Tempo integral · Híbrido · Londrina, PR"
  summary: string; // one-liner for the page lede and meta description
  results?: string[];
  skills?: string[];
  photos?: ExperiencePhoto[];
}

const SHOW_DRAFTS = process.env.NODE_ENV !== "production";

async function readSource(slug: string, locale: Locale) {
  "use cache";
  try {
    return await readFile(path.join(EXPERIENCE_DIR, slug, `${locale}.mdx`), "utf8");
  } catch {
    return null;
  }
}

export async function getExperience(slug: string, locale: Locale, components = {}) {
  const source = await readSource(slug, locale);
  if (!source) return null;

  const page = await compileMDX<ExperienceFrontmatter>({
    source,
    components,
    options: { parseFrontmatter: true },
  });
  if (page.frontmatter.status !== "published" && !SHOW_DRAFTS) return null;
  return page;
}

export async function getExperienceSlugs() {
  "use cache";
  return readdir(EXPERIENCE_DIR);
}

// Slugs with a page in this locale, so the home only links rows that have one.
export async function getExperienceLinks(locale: Locale) {
  const slugs = await getExperienceSlugs();
  const pages = await Promise.all(slugs.map((slug) => getExperience(slug, locale)));
  return new Set(pages.filter((p) => p !== null).map((p) => p.frontmatter.slug));
}
