import { readFile } from "node:fs/promises";
import path from "node:path";
import { en } from "./en";
import { getExperience } from "./experience";
import { pt } from "./pt";
import { absolute } from "./seo";
import { ABOUT_PATH, CASE_PATH, EXPERIENCE_PATH, HOME_PATH } from "./shared";
import { getStories, getStory } from "./star";
import type { Dictionary, Locale } from "./types";
import { contentVersion } from "./version";

// Everything on the site as one Markdown file for LLMs (/llms.txt and /en/llms.txt), built from the
// same content as the pages, so it never drifts. Only published pages go in; drafts stay out.

const DICT: Record<Locale, Dictionary> = { pt, en };

const L = {
  pt: {
    otherLang: "English version",
    otherFile: "/en/llms.txt",
    contact: "Contato",
    pages: "Páginas",
    home: "Início",
    homeNote: "apresentação, experiência e projetos",
    experienceNote: "histórico completo",
    aboutNote: "quem sou, no que acredito e com o que construo",
    site: "Site",
    page: "Página",
    results: "Resultados",
    skills: "Habilidades",
    photos: "Fotos",
    milestones: "Marcos",
    cases: "Cases",
    caseMeta: "Cargo",
    metrics: "Métricas",
    before: "antes",
    after: "depois",
    now: "atual",
  },
  en: {
    otherLang: "Versão em português",
    otherFile: "/llms.txt",
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
  },
} as const;

// MDX body without its frontmatter, headings pushed down so they nest under the section they land in,
// and the story components (mdx.tsx) flattened to Markdown.
async function body(dir: string, slug: string, locale: Locale, depth: number) {
  const source = await readFile(path.join(process.cwd(), "content", dir, slug, `${locale}.mdx`), "utf8");
  return source
    .replace(/^---\n[\s\S]*?\n---\n/, "")
    .replace(/^(#{1,6}) /gm, (_, h: string) => `${"#".repeat(Math.min(6, h.length + depth))} `)
    .replace(/<\/?Timeline>\s*/g, "")
    .replace(/^[ \t]*<Moment\s[^>]*?date="([^"]*)"[^>]*?title="([^"]*)"[\s\S]*?>\s*/gm, "- **$1 · $2.** ")
    .replace(/\s*<\/Moment>/g, "")
    .replace(/<Person\s[^>]*?name="([^"]*)"[^>]*\/>/g, "$1")
    .replace(/<Person\s[^>]*>([\s\S]*?)<\/Person>/g, "$1")
    .trim();
}

// `version` only keys the cache (see contentVersion).
export async function buildLlms(locale: Locale, version: number) {
  "use cache";
  void version;
  const d = DICT[locale];
  const t = L[locale];
  const out: string[] = [];
  const push = (...lines: string[]) => out.push(...lines);

  // Intro: everything at the top of the home page.
  push(`# ${d.intro.name}`, "", `> ${d.meta.description}`, "");
  push(`**${d.lede.strong}** ${d.lede.text}`, "");
  for (const { term, value } of d.kv) push(`- ${term}: ${value}`);
  push("", `${t.otherLang}: ${absolute(t.otherFile)}`, "");

  push(`## ${t.contact}`, "");
  for (const c of d.contacts) push(`- ${c.label}: [${c.value}](${c.href})`);
  push("");

  // Published experience pages and cases, in the order the home shows them.
  const jobs = await Promise.all(d.work.items.map((job) => (job.slug ? getExperience(job.slug, locale) : null)));
  const stories = await getStories(locale);

  push(`## ${t.pages}`, "");
  push(`- [${t.home}](${absolute(HOME_PATH[locale])}): ${t.homeNote}`);
  push(`- [${d.work.title}](${absolute(EXPERIENCE_PATH[locale])}): ${t.experienceNote}`);
  d.work.items.forEach((job, i) => {
    if (job.slug && jobs[i]) push(`  - [${job.role} · ${job.org}](${absolute(`${EXPERIENCE_PATH[locale]}/${job.slug}`)})`);
  });
  for (const s of stories) push(`- [${s.title}](${absolute(`${CASE_PATH[locale]}/${s.slug}`)})`);
  push(`- [${d.about.title}](${absolute(ABOUT_PATH[locale])}): ${t.aboutNote}`, "");

  // Work: the home row, then the full experience page when there is one.
  push(`## ${d.work.title}`, "");
  for (const [i, job] of d.work.items.entries()) {
    const page = jobs[i];
    push(`### ${job.role} · ${job.org} (${job.when})`, "");
    if (job.where) push(job.where, "");
    if (job.orgHref) push(`${t.site}: ${job.orgHref}`);
    if (page && job.slug) push(`${t.page}: ${absolute(`${EXPERIENCE_PATH[locale]}/${job.slug}`)}`);
    push("", job.description, "");
    if (!page || !job.slug) continue;
    const fm = page.frontmatter;
    if (fm.summary && fm.summary !== job.description) push(fm.summary, "");
    if (fm.results?.length) push(`#### ${t.results}`, "", ...fm.results.map((r) => `- ${r}`), "");
    if (fm.skills?.length) push(`${t.skills}: ${fm.skills.join(", ")}`, "");
    push(await body("experience", job.slug, locale, 2), "");
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
    push(`- [${project.name} · ${project.org}](${absolute(`${CASE_PATH[locale]}/${project.slug}`)}): ${project.description}`);
  }
  push("");
  if (stories.length) {
    push(`## ${t.cases}`, "");
    for (const s of stories) {
      const story = await getStory(s.slug, locale);
      if (!story) continue;
      const fm = story.frontmatter;
      push(`### ${fm.title}`, "");
      push(`${absolute(`${CASE_PATH[locale]}/${fm.slug}`)}`, "");
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
      push(await body("star", fm.slug, locale, 2), "");
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

export const llmsResponse = async (locale: Locale) =>
  new Response(await buildLlms(locale, contentVersion()), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
