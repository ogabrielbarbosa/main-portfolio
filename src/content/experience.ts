import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { compileMDX } from "next-mdx-remote/rsc";
import type { Locale } from "./types";
import { contentVersion } from "./version";

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
  project?: string; // slug of a project in the dictionary, linked at the end of the page
}

const SHOW_DRAFTS = process.env.NODE_ENV !== "production";

// `version` only keys the cache (see contentVersion).
async function readSource(slug: string, locale: Locale, version: number) {
  "use cache";
  void version;
  try {
    return await readFile(path.join(EXPERIENCE_DIR, slug, `${locale}.mdx`), "utf8");
  } catch {
    return null;
  }
}

export async function getExperience(slug: string, locale: Locale, components = {}) {
  const source = await readSource(slug, locale, contentVersion());
  if (!source) return null;

  const page = await compileMDX<ExperienceFrontmatter>({
    source,
    components,
    // Our own MDX passes plain arrays as props (<Moment photos={[...]}>), so plain JS
    // expressions are allowed; dangerous ones (eval, require, ...) stay blocked.
    options: { parseFrontmatter: true, blockJS: false, blockDangerousJS: true },
  });
  if (page.frontmatter.status !== "published" && !SHOW_DRAFTS) return null;
  return page;
}

async function readSlugs(version: number) {
  "use cache";
  void version;
  return readdir(EXPERIENCE_DIR);
}

export const getExperienceSlugs = async () => readSlugs(contentVersion());

// Slug -> summary of each page in this locale: the home only links rows that have one,
// and shows the page's summary so the row and the page say the same thing.
export async function getExperienceLinks(locale: Locale) {
  const slugs = await getExperienceSlugs();
  const pages = await Promise.all(slugs.map((slug) => getExperience(slug, locale)));
  return new Map(
    pages.filter((p) => p !== null).map((p) => [p.frontmatter.slug, p.frontmatter.summary] as const),
  );
}
