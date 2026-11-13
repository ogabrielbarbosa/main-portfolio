import type { Metadata } from "next";
import { CasePage } from "@/components/CasePage";
import { en } from "@/content/en";
import { pageMetadata } from "@/content/seo";
import { CASE_PATH } from "@/content/shared";
import { getSlugs, getStory } from "@/content/star";

// Every case is prerendered from generateStaticParams; unknown slugs just 404,
// so there is no loading state worth streaming.
export const instant = false;

export async function generateStaticParams() {
  const slugs = await getSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/en/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStory(slug, "en");
  if (!story) return {};
  return pageMetadata({
    locale: "en",
    paths: { pt: `${CASE_PATH.pt}/${slug}`, en: `${CASE_PATH.en}/${slug}` },
    title: `${story.frontmatter.title} — Gabriel Barbosa`,
    description: story.frontmatter.summary,
    type: "article",
  });
}

export default async function Page({ params }: PageProps<"/en/projects/[slug]">) {
  const { slug } = await params;
  return <CasePage dict={en} slug={slug} />;
}
