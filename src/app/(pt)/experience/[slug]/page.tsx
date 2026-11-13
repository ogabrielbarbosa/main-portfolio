import type { Metadata } from "next";
import { ExperiencePage } from "@/components/ExperiencePage";
import { pt } from "@/content/pt";
import { pageMetadata } from "@/content/seo";
import { EXPERIENCE_PATH } from "@/content/shared";
import { getExperience, getExperienceSlugs } from "@/content/experience";

// Every page is prerendered from generateStaticParams; unknown slugs just 404.
export const instant = false;

export async function generateStaticParams() {
  const slugs = await getExperienceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/experience/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = await getExperience(slug, "pt");
  if (!page) return {};
  const { role, company, summary } = page.frontmatter;
  return pageMetadata({
    locale: "pt",
    paths: { pt: `${EXPERIENCE_PATH.pt}/${slug}`, en: `${EXPERIENCE_PATH.en}/${slug}` },
    title: `${role} · ${company} — Gabriel Barbosa`,
    description: summary,
    type: "article",
  });
}

export default async function Page({ params }: PageProps<"/experience/[slug]">) {
  const { slug } = await params;
  return <ExperiencePage dict={pt} slug={slug} />;
}
