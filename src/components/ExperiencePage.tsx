import { notFound } from "next/navigation";
import { getExperience } from "@/content/experience";
import { CASE_PATH, HOME_PATH, SECTION_IDS } from "@/content/shared";
import { formatPeriod, getStories } from "@/content/star";
import type { Dictionary } from "@/content/types";
import { Shell } from "./Shell";

export async function ExperiencePage({ dict, slug }: { dict: Dictionary; slug: string }) {
  const { locale, experience: t, caseStudy } = dict;
  const page = await getExperience(slug, locale);
  if (!page) notFound();

  const { frontmatter: fm, content } = page;
  const cases = (await getStories(locale)).filter((s) => s.company === fm.company);
  const backHref = `${HOME_PATH[locale]}#${SECTION_IDS.work}`;

  return (
    <Shell dict={dict}>
      <article className="post">
        <p className="more" style={{ margin: "0 0 24px" }}>
          <a href={backHref}>← {caseStudy.back}</a>
        </p>
        <h1>
          {fm.role} · {fm.companyHref ? <a href={fm.companyHref}>{fm.company}</a> : fm.company}
        </h1>
        <p className="meta">
          {formatPeriod(fm.period, locale, caseStudy.now).toLowerCase()} · {fm.where}
        </p>
        <p className="lede">{fm.summary}</p>

        {fm.results && fm.results.length > 0 && (
          <>
            <h2 className="label">{t.results}</h2>
            <ul>
              {fm.results.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </>
        )}

        {content}

        {fm.photos && fm.photos.length > 0 && (
          <>
            <h2 className="label">{t.photos}</h2>
            <div className="gallery">
              {fm.photos.map((photo) => (
                <figure key={photo.src}>
                  <a href={photo.src}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- photos come from MDX frontmatter */}
                    <img src={photo.src} alt={photo.alt} loading="lazy" />
                  </a>
                  {photo.caption && <figcaption>{photo.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </>
        )}

        {cases.length > 0 && (
          <>
            <h2 className="label">{t.cases}</h2>
            <ol className="log">
              {cases.map((story, i) => (
                <li key={story.slug} className="numbered">
                  <span className="when">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>
                      <a href={`${CASE_PATH[locale]}/${story.slug}`}>{story.title}</a>
                    </h3>
                  </div>
                </li>
              ))}
            </ol>
          </>
        )}

        {fm.skills && fm.skills.length > 0 && (
          <>
            <h2 className="label">{caseStudy.stack}</h2>
            <ul className="tags">
              {fm.skills.map((skill) => (
                <li key={skill}>{skill}</li>
              ))}
            </ul>
          </>
        )}
      </article>
    </Shell>
  );
}
