import { notFound } from "next/navigation";
import { HOME_PATH, SECTION_IDS } from "@/content/shared";
import { formatPeriod, getStory, type StarEvidence } from "@/content/star";
import type { Dictionary } from "@/content/types";
import { Shell } from "./Shell";

export async function CasePage({ dict, slug }: { dict: Dictionary; slug: string }) {
  const { locale, caseStudy } = dict;
  const story = await getStory(slug, locale);
  if (!story) notFound();

  const { frontmatter: fm, content } = story;
  const backHref = `${HOME_PATH[locale]}#${SECTION_IDS.projects}`;

  return (
    <Shell dict={dict}>
      <article className="post">
        <p className="more" style={{ margin: "0 0 24px" }}>
          <a href={backHref}>← {caseStudy.back}</a>
        </p>
        <h1>{fm.title}</h1>
        <p className="meta">
          {fm.company} · {fm.role} · {formatPeriod(fm.period, locale, caseStudy.now).toLowerCase()}
        </p>
        <p className="lede">{fm.summary}</p>

        {fm.metrics && fm.metrics.length > 0 && (
          <>
            <h2 className="label">{caseStudy.metrics}</h2>
            <dl className="kv">
              {fm.metrics.map((m) => (
                <div key={m.label} style={{ display: "contents" }}>
                  <dt>{m.value}</dt>
                  <dd>
                    {m.label}
                    {m.before && m.after && (
                      <span style={{ color: "var(--muted)" }}>
                        {" "}
                        ({caseStudy.before} {m.before} → {caseStudy.after} {m.after})
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </>
        )}

        {content}

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

        {fm.evidence && fm.evidence.length > 0 && (
          <>
            <h2 className="label">{caseStudy.evidence}</h2>
            <ol className="log">
              {fm.evidence.map((item) => (
                <Evidence key={item.id} item={item} />
              ))}
            </ol>
          </>
        )}
      </article>
    </Shell>
  );
}

function Evidence({ item }: { item: StarEvidence }) {
  if (item.type === "quote") {
    return (
      <li>
        <span className="when">{item.author}</span>
        <blockquote>
          <p>“{item.text}”</p>
        </blockquote>
      </li>
    );
  }

  if (item.type === "image" && item.src) {
    return (
      <li>
        <span className="when">{item.type}</span>
        <figure style={{ margin: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- evidence images come from MDX frontmatter */}
          <img src={item.src} alt={item.alt ?? item.caption} />
          <figcaption>
            <p>{item.caption}</p>
          </figcaption>
        </figure>
      </li>
    );
  }

  if (!item.src) return null;
  return (
    <li>
      <span className="when">{item.type}</span>
      <div>
        <h3>
          <a href={item.src}>{item.caption}</a>
        </h3>
      </div>
    </li>
  );
}
