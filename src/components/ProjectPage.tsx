import { notFound } from "next/navigation";
import { CASE_PATH, HOME_PATH, SECTION_IDS } from "@/content/shared";
import { getStories } from "@/content/star";
import type { Dictionary } from "@/content/types";
import { Shell } from "./Shell";

export const getProject = (dict: Dictionary, slug: string) => dict.projects.items.find((p) => p.slug === slug);

// A project in full (/projects/<slug>): what it is, results, my contributions and its milestones,
// each linking to its STAR case when that case is visible.
export async function ProjectPage({ dict, slug }: { dict: Dictionary; slug: string }) {
  const { locale, caseStudy, projects } = dict;
  const project = getProject(dict, slug);
  if (!project) notFound();

  const stories = new Map((await getStories(locale)).map((s) => [s.slug, s]));
  const backHref = `${HOME_PATH[locale]}#${SECTION_IDS.projects}`;

  return (
    <Shell dict={dict}>
      <article className="post">
        <p className="more" style={{ margin: "0 0 24px" }}>
          <a href={backHref}>← {caseStudy.back}</a>
        </p>
        <h1>{project.tagline}</h1>
        <p className="meta">
          {project.name} · {project.when}
        </p>
        <p className="lede">{project.description}</p>

        {project.about?.map((p) => <p key={p}>{p}</p>)}

        {project.results && project.results.length > 0 && (
          <>
            <h2 className="label">{projects.results}</h2>
            <ul>
              {project.results.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </>
        )}

        {project.contributions && project.contributions.length > 0 && (
          <>
            <h2 className="label">{projects.contributions}</h2>
            <ul>
              {project.contributions.map((c) => (
                <li key={c.title}>
                  <strong>{c.title}</strong> {c.text}
                </li>
              ))}
            </ul>
          </>
        )}

        {project.milestones && project.milestones.length > 0 && (
          <>
            <h2 className="label">{projects.cases}</h2>
            <ol className="log">
              {project.milestones.map((m, i) => {
                const story = stories.get(m.slug);
                return (
                  <li key={m.slug} className="numbered">
                    <span className="when">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3>{story ? <a href={`${CASE_PATH[locale]}/${m.slug}`}>{story.title}</a> : m.text}</h3>
                    </div>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </article>
    </Shell>
  );
}
