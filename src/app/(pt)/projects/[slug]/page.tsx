import type { Metadata } from "next";
import { CasePage } from "@/components/CasePage";
import { getProject, ProjectPage } from "@/components/ProjectPage";
import { pt } from "@/content/pt";
import { pageMetadata } from "@/content/seo";
import { CASE_PATH } from "@/content/shared";
import { getSlugs, getStory } from "@/content/star";

// /projects/<slug> is a project page when the slug names a project, otherwise a case.
// Every page is prerendered from generateStaticParams; unknown slugs just 404,
// so there is no loading state worth streaming.
export const instant = false;

export async function generateStaticParams() {
  const slugs = [...pt.projects.items.map((p) => p.slug), ...(await getSlugs())];
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(pt, slug);
  if (project) {
    return pageMetadata({
      locale: "pt",
      paths: { pt: `${CASE_PATH.pt}/${slug}`, en: `${CASE_PATH.en}/${slug}` },
      title: `${project.tagline} · ${project.name} — Gabriel Barbosa`,
      description: project.description,
      type: "article",
    });
  }
  const story = await getStory(slug, "pt");
  if (!story) return {};
  return pageMetadata({
    locale: "pt",
    paths: { pt: `${CASE_PATH.pt}/${slug}`, en: `${CASE_PATH.en}/${slug}` },
    title: `${story.frontmatter.title} — Gabriel Barbosa`,
    description: story.frontmatter.summary,
    type: "article",
  });
}

export default async function Page({ params }: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  if (getProject(pt, slug)) return <ProjectPage dict={pt} slug={slug} />;
  return <CasePage dict={pt} slug={slug} />;
}
