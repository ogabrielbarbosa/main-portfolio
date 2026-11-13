import type { MetadataRoute } from "next";
import { getExperience, getExperienceSlugs } from "@/content/experience";
import { absolute, type PagePaths } from "@/content/seo";
import { ABOUT_PATH, CASE_PATH, EXPERIENCE_PATH, HOME_PATH } from "@/content/shared";
import { getStories } from "@/content/star";
import { pt } from "@/content/pt";

// Every published page in both languages, each pointing at its translation.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const jobs = (
    await Promise.all(
      (await getExperienceSlugs()).map(async (slug) => ((await getExperience(slug, "pt")) ? slug : null)),
    )
  ).filter((slug) => slug !== null);
  const cases = [...pt.projects.items.map((p) => p.slug), ...(await getStories("pt")).map((s) => s.slug)];

  const pages: { paths: PagePaths; priority: number }[] = [
    { paths: HOME_PATH, priority: 1 },
    { paths: ABOUT_PATH, priority: 0.8 },
    { paths: EXPERIENCE_PATH, priority: 0.8 },
    ...jobs.map((slug) => ({ paths: { pt: `${EXPERIENCE_PATH.pt}/${slug}`, en: `${EXPERIENCE_PATH.en}/${slug}` }, priority: 0.7 })),
    ...cases.map((slug) => ({ paths: { pt: `${CASE_PATH.pt}/${slug}`, en: `${CASE_PATH.en}/${slug}` }, priority: 0.7 })),
  ];

  return pages.flatMap(({ paths, priority }) =>
    (["pt", "en"] as const).map((locale) => ({
      url: absolute(paths[locale]),
      priority: locale === "pt" ? priority : priority - 0.1,
      alternates: { languages: { "pt-BR": absolute(paths.pt), en: absolute(paths.en) } },
    })),
  );
}
