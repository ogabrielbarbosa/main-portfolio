import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { compileMDX } from "next-mdx-remote/rsc";
import type { Locale } from "./types";
import { contentVersion } from "./version";

// STAR cases live in content/star/<slug>/<locale>.mdx (schema: .claude/skills/star-story/references/schema.md).
const STAR_DIR = path.join(process.cwd(), "content/star");

export interface StarMetric {
  label: string;
  before?: string;
  after?: string;
  value: string;
  approximate?: boolean;
}

export interface StarFrontmatter {
  title: string;
  name: string;
  slug: string;
  locale: Locale;
  status: "draft" | "published";
  summary: string;
  role: string;
  company: string;
  period: { start: string; end?: string };
  skills?: string[];
  metrics?: StarMetric[];
  order?: number;
}

// Drafts show up in `next dev` so cases can be reviewed before they go live.
const SHOW_DRAFTS = process.env.NODE_ENV !== "production";

// Files only change between builds, so reads are cached (required by Cache Components).
// `version` only keys the cache (see contentVersion).
async function readSource(slug: string, locale: Locale, version: number) {
  "use cache";
  void version;
  try {
    return await readFile(path.join(STAR_DIR, slug, `${locale}.mdx`), "utf8");
  } catch {
    return null;
  }
}

export async function getStory(slug: string, locale: Locale, components = {}) {
  const source = await readSource(slug, locale, contentVersion());
  if (!source) return null;

  const story = await compileMDX<StarFrontmatter>({
    source,
    components,
    // Plain object props (<Compare before={{...}}>) need JS expressions; dangerous ones stay blocked.
    options: { parseFrontmatter: true, blockJS: false, blockDangerousJS: true },
  });
  if (story.frontmatter.status !== "published" && !SHOW_DRAFTS) return null;
  return story;
}

// Every case folder, drafts included: draft pages 404 in production instead of
// leaving generateStaticParams empty (Cache Components requires at least one param).
async function readSlugs(version: number) {
  "use cache";
  void version;
  return readdir(STAR_DIR);
}

export const getSlugs = async () => readSlugs(contentVersion());

export async function getStories(locale: Locale) {
  const slugs = await getSlugs();
  const stories = await Promise.all(slugs.map((slug) => getStory(slug, locale)));

  return stories
    .filter((story) => story !== null)
    .map((story) => story.frontmatter)
    .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));
}

const MONTHS: Record<Locale, string[]> = {
  pt: ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"],
  en: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
};

// "2025-06" → "JUN 2025"
function formatMonth(month: string, locale: Locale) {
  const [year, m] = month.split("-");
  return `${MONTHS[locale][Number(m) - 1]} ${year}`;
}

export function formatPeriod(period: StarFrontmatter["period"], locale: Locale, now: string) {
  return `${formatMonth(period.start, locale)} — ${period.end ? formatMonth(period.end, locale) : now}`;
}
