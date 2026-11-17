import { readFile } from "node:fs/promises";
import path from "node:path";
import { en } from "./en";
import { getExperience } from "./experience";
import { absolute } from "./seo";
import { ABOUT_PATH, CASE_PATH, EXPERIENCE_PATH, HOME_PATH } from "./shared";
import { formatPeriod, getStories, getStory } from "./star";
import type { Locale } from "./types";
import { contentVersion } from "./version";

// Everything on the site as one Markdown file for LLMs (/llms.txt, always in English), built from the
// same content as the pages, so it never drifts. Only published pages go in; drafts stay out.

const d = en;
const LOCALE: Locale = "en";

const L = {
  contact: "Contact",
  pages: "Pages",
  home: "Home",
  homeNote: "intro, work and projects",
  experienceNote: "full work history",
  aboutNote: "who I am, what I believe and what I build with",
  site: "Website",
  page: "Page",
  results: "Results",
  skills: "Skills",
  photos: "Photos",
  milestones: "Milestones",
  cases: "Case studies",
  caseMeta: "Role",
  metrics: "Metrics",
  before: "before",
  after: "after",
  now: "present",
};

// MDX body without its frontmatter, headings pushed down so they nest under the section they land in,
// and the story components (mdx.tsx) flattened to Markdown.
async function body(dir: string, slug: string, depth: number) {
  const source = await readFile(path.join(process.cwd(), "content", dir, slug, `${LOCALE}.mdx`), "utf8");
  return source
    .replace(/^---\n[\s\S]*?\n---\n/, "")
    .replace(/^(#{1,6}) /gm, (_, h: string) => `${"#".repeat(Math.min(6, h.length + depth))} `)
    .replace(/<\/?Timeline>\s*/g, "")
    // Every prop the page shows: date, title, place, text, and each photo with its caption.
    .replace(new RegExp(`[ \\t]*<Moment\\s(${PROPS})>([\\s\\S]*?)</Moment>`, "g"), (_, props: string, text: string) => {
      const place = prop(props, "place");
      const head = `**${prop(props, "date")} · ${prop(props, "title")}**${place ? ` (${place})` : ""}`;
      const pics = images(props).map((i) => `- [${i.caption ?? i.alt}](${absolute(i.src)})`);
      return [head, text.trim(), ...(pics.length ? [pics.join("\n")] : [])].join("\n\n") + "\n";
    })
    .replace(new RegExp(`<Person\\s(${PROPS})(?:/>|>([\\s\\S]*?)</Person>)`, "g"), (_, props: string, text?: string) => {
      const extra = [prop(props, "role"), prop(props, "note")].filter(Boolean).join("; ");
      return `${text ?? prop(props, "name")}${extra ? ` (${extra})` : ""}`;
    })
    .replace(new RegExp(`<ProjectLink\\s(${PROPS})>([\\s\\S]*?)</ProjectLink>`, "g"), (_, props: string, text: string) =>
      `[${text}](${absolute(prop(props, "href") ?? "")})`,
    )
    .replace(new RegExp(`<Compare\\s(${PROPS})/>`, "g"), (_, props: string) => {
      const pics = images(props).map((i) => `- ${i.label ? `${i.label}: ` : ""}[${i.alt}](${absolute(i.src)})`);
      const caption = prop(props, "caption");
      return [pics.join("\n"), ...(caption ? [caption] : [])].join("\n\n");
    })
    .trim();
}

// A component's props up to its closing `>`, skipping any `>` inside quoted strings.
const PROPS = `(?:[^>"]|"[^"]*")*?`;
// A plain string prop (name="value"); props inside JS objects are not matched.
const prop = (props: string, name: string) => props.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`))?.[1];
// Image objects in props ({ src: "...", alt: "...", label?: "...", caption?: "..." }), in order.
function images(props: string) {
  return [...props.matchAll(/\{([^{}]*\bsrc:\s*"[^"]*"[^{}]*)\}/g)].map(([, obj]) => {
    const field = (k: string) => obj.match(new RegExp(`\\b${k}:\\s*"([^"]*)"`))?.[1];
    return { src: field("src")!, alt: field("alt") ?? "", label: field("label"), caption: field("caption") };
  });
}

// `version` only keys the cache (see contentVersion).
export async function buildLlms(version: number) {
  "use cache";
  void version;
  const t = L;
  const out: string[] = [];
  const push = (...lines: string[]) => out.push(...lines);

  // Intro: everything at the top of the home page.
  push(`# ${d.intro.name}`, "", `> ${d.meta.description}`, "");
  push(`**${d.lede.strong}** ${d.lede.text}`, "");
  for (const { term, value } of d.kv) push(`- ${term}: ${value}`);
  push("");

  push(`## ${t.contact}`, "");
  for (const c of d.contacts) push(`- ${c.label}: [${c.value}](${c.href})`);
  push("");

  // Published experience pages and cases, in the order the home shows them.
  const jobs = await Promise.all(d.work.items.map((job) => (job.slug ? getExperience(job.slug, LOCALE) : null)));
  const stories = await getStories(LOCALE);

  push(`## ${t.pages}`, "");
  push(`- [${t.home}](${absolute(HOME_PATH[LOCALE])}): ${t.homeNote}`);
  push(`- [${d.work.title}](${absolute(EXPERIENCE_PATH[LOCALE])}): ${t.experienceNote}`);
  d.work.items.forEach((job, i) => {
    if (job.slug && jobs[i]) push(`  - [${job.role} · ${job.org}](${absolute(`${EXPERIENCE_PATH[LOCALE]}/${job.slug}`)})`);
  });
  for (const s of stories) push(`- [${s.title}](${absolute(`${CASE_PATH[LOCALE]}/${s.slug}`)})`);
  push(`- [${d.about.title}](${absolute(ABOUT_PATH[LOCALE])}): ${t.aboutNote}`, "");

  // Work: the home row, then the full experience page when there is one.
  push(`## ${d.work.title}`, "");
  for (const [i, job] of d.work.items.entries()) {
    const page = jobs[i];
    push(`### ${job.role} · ${job.org} (${job.when})`, "");
    if (job.where) push(job.where, "");
    if (job.orgHref) push(`${t.site}: ${job.orgHref}`);
    if (page && job.slug) push(`${t.page}: ${absolute(`${EXPERIENCE_PATH[LOCALE]}/${job.slug}`)}`);
    push("", job.description, "");
    if (!page || !job.slug) continue;
    const fm = page.frontmatter;
    push(`${formatPeriod(fm.period, LOCALE, t.now).toLowerCase()} · ${fm.where}`, "");
    if (fm.summary && fm.summary !== job.description) push(fm.summary, "");
    if (fm.context) push(fm.context, "");
    if (fm.results?.length) push(`#### ${t.results}`, "", ...fm.results.map((r) => `- ${r}`), "");
    if (fm.skills?.length) push(`${t.skills}: ${fm.skills.join(", ")}`, "");
    push(await body("experience", job.slug, 2), "");
    if (fm.photos?.length) {
      push(`#### ${t.photos}`, "");
      for (const p of fm.photos) push(`- [${p.caption ?? p.alt}](${absolute(p.src)})`);
      push("");
    }
  }

  // Projects: one row each; the full case follows in the cases section.
  push(`## ${d.projects.title}`, "");
  if (!d.projects.items.length) push(d.projects.empty, "");
  for (const project of d.projects.items) {
    push(`- [${project.name} · ${project.org}](${absolute(`${CASE_PATH[LOCALE]}/${project.slug}`)}): ${project.description}`);
  }
  push("");
  if (stories.length) {
    push(`## ${t.cases}`, "");
    for (const s of stories) {
      const story = await getStory(s.slug, LOCALE);
      if (!story) continue;
      const fm = story.frontmatter;
      push(`### ${fm.title}`, "");
      push(`${absolute(`${CASE_PATH[LOCALE]}/${fm.slug}`)}`, "");
      push(`${t.caseMeta}: ${fm.role} · ${fm.company} (${fm.period.start} – ${fm.period.end ?? t.now})`, "");
      push(fm.summary, "");
      if (fm.metrics?.length) {
        push(`#### ${t.metrics}`, "");
        for (const m of fm.metrics) {
          const change = m.before && m.after ? ` (${t.before} ${m.before}, ${t.after} ${m.after})` : "";
          push(`- ${m.label}: ${m.value}${change}`);
        }
        push("");
      }
      if (fm.skills?.length) push(`${t.skills}: ${fm.skills.join(", ")}`, "");
      push(await body("star", fm.slug, 2), "");
    }
  }

  // About page.
  push(`## ${d.about.title}`, "", ...d.about.paragraphs.flatMap((p) => [p, ""]));
  push(`### ${d.about.principlesTitle}`, "");
  for (const p of d.about.principles) push(`#### ${p.title}`, "", p.description, "");
  push(`### ${d.about.stackTitle}`, "");
  for (const g of d.about.stack) push(`- ${g.name}: ${g.items.join(", ")}`);
  push("");

  return out.join("\n").replace(/\n{3,}/g, "\n\n");
}

export const llmsResponse = async () =>
  new Response(await buildLlms(contentVersion()), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
