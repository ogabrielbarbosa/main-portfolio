import Image from "next/image";
import photo from "@/assets/gabriel.jpeg";
import { CASE_PATH, SECTION_IDS } from "@/content/shared";
import type { Dictionary } from "@/content/types";
import { Logo } from "./Logos";
import { PersonJsonLd } from "./PersonJsonLd";
import { Shell } from "./Shell";
import { WorkList } from "./WorkList";

// Newest jobs on the home; the rest are on the full work page (work.more).
const HOME_JOBS = 3;

export async function HomePage({ dict }: { dict: Dictionary }) {
  const { intro, lede, kv, contacts, work, projects, locale } = dict;

  return (
    <Shell dict={dict}>
      <PersonJsonLd dict={dict} />
      <div className="intro">
        <Image className="avatar" src={photo} alt={intro.photoAlt} width={72} height={72} priority />
        <h1>{intro.name}</h1>
      </div>
      <p className="lede">
        <strong>{lede.strong}</strong> {lede.text}
      </p>

      <dl className="kv">
        {kv.map(({ term, value }) => (
          <div key={term} style={{ display: "contents" }}>
            <dt>{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <nav className="links" aria-label={locale === "pt" ? "Redes" : "Elsewhere"}>
        {contacts.map((c) => (
          <a key={c.icon} href={c.href} rel="me" aria-label={c.label} title={c.label}>
            <Logo icon={c.icon} />
          </a>
        ))}
      </nav>

      <h2 id={SECTION_IDS.work}>{work.title}</h2>
      <WorkList dict={dict} items={work.items.slice(0, HOME_JOBS)} />
      <p className="more">
        <a href={work.more.href}>{work.more.label}</a>
      </p>

      <h2 id={SECTION_IDS.projects}>{projects.title}</h2>
      <ProjectList dict={dict} />
    </Shell>
  );
}

// Projects on the home: a short row each; the tagline opens the full project page.
export function ProjectList({ dict }: { dict: Dictionary }) {
  const { projects, locale } = dict;
  if (!projects.items.length) return <p className="empty">{projects.empty}</p>;

  return (
    <ol className="log">
      {projects.items.map((project) => {
        const page = `${CASE_PATH[locale]}/${project.slug}`;
        return (
          <li key={project.slug}>
            <span className="when">{project.when}</span>
            <div>
              <h3>
                <a href={page}>{project.tagline}</a> <span className="org">· {project.name}</span>
              </h3>
              <p>{project.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
