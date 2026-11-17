import { notFound } from "next/navigation";
import { HOME_PATH, SECTION_IDS } from "@/content/shared";
import { formatPeriod, getStory, type StarMetric } from "@/content/star";
import type { Dictionary } from "@/content/types";

import { mdxComponents } from "./mdx";
import { Shell } from "./Shell";

export async function CasePage({ dict, slug }: { dict: Dictionary; slug: string }) {
  const { locale, caseStudy } = dict;
  const story = await getStory(slug, locale, mdxComponents);
  if (!story) notFound();

  const { frontmatter: fm, content } = story;
  const backHref = `${HOME_PATH[locale]}#${SECTION_IDS.projects}`;

  return (
    <Shell dict={dict}>
      <article className="post">
        <p className="more" style={{ margin: "0 0 24px" }}>
          <a href={backHref}>← {caseStudy.back}</a>
        </p>
        <h1>{fm.name}</h1>
        <p className="meta">
          {fm.company} · {fm.role} · {formatPeriod(fm.period, locale, caseStudy.now).toLowerCase()}
        </p>
        <p className="lede">{fm.summary}</p>

        {fm.metrics && fm.metrics.length > 0 && (
          <>
            <h2 className="label">{caseStudy.metrics}</h2>
            <ul className="board" style={{ "--cols": Math.min(fm.metrics.length, 3) } as React.CSSProperties}>
              {fm.metrics.map((m) => (
                <MetricCard key={m.label} metric={m} labels={caseStudy} />
              ))}
            </ul>
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

      </article>
    </Shell>
  );
}

// "~40M" → 40_000_000, "~1,7" → 1.7, "1.100+" / "1,100+" → 1100, "20 mil+" → 20_000,
// "5 de 7" / "5 of 7" → 5/7 (a share). Returns null when there is no number to draw.
function parseNum(raw: string): number {
  // A separator followed by exactly three digits groups thousands (pt "1.100", en "1,100"); otherwise it is a decimal.
  const s = /^\d{1,3}([.,]\d{3})+$/.test(raw) ? raw.replace(/[.,]/g, "") : raw.replace(",", ".");
  return parseFloat(s);
}

function toNumber(raw: string): number | null {
  const share = raw.match(/(\d+(?:[.,]\d+)*)\s+(?:de|of)\s+(\d+(?:[.,]\d+)*)/);
  if (share) return parseNum(share[1]) / parseNum(share[2]);
  const m = raw.match(/(\d+(?:[.,]\d+)*)\s*(k|mil|M|B)?/);
  if (!m) return null;
  const scale = { k: 1e3, mil: 1e3, M: 1e6, B: 1e9 }[m[2] ?? ""] ?? 1;
  return parseNum(m[1]) * scale;
}

// One result: the headline number, what it measures and, when it has a before and after,
// two bars sized against the larger of the two (or 100 for percentages).
function MetricCard({ metric: m, labels }: { metric: StarMetric; labels: Dictionary["caseStudy"] }) {
  const before = m.before ? toNumber(m.before) : null;
  const after = m.after ? toNumber(m.after) : null;
  // Percentages are drawn against 100%; anything else against the larger of the two.
  const percent = /%/.test(`${m.before}${m.after}`);
  const max = before !== null && after !== null ? (percent ? 100 : Math.max(before, after)) : 0;
  const width = (n: number) => `${max ? Math.max((n / max) * 100, 1.5) : 0}%`;

  return (
    <li>
      <strong className="value">{m.value}</strong>
      <span className="what">{m.label}</span>
      {m.before && m.after && max > 0 && (
        <div className="bars">
          <span className="tag">{labels.before}</span>
          <span className="bar">
            <i style={{ width: width(before!) }} />
          </span>
          <span className="num">{m.before}</span>
          <span className="tag">{labels.after}</span>
          <span className="bar after">
            <i style={{ width: width(after!) }} />
          </span>
          <span className="num">{m.after}</span>
        </div>
      )}
    </li>
  );
}
