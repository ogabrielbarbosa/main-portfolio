import { getExperienceLinks } from "@/content/experience";
import { EXPERIENCE_PATH } from "@/content/shared";
import type { Dictionary, Job } from "@/content/types";

// Job rows; a role links to its page when content/experience/<slug> exists in this locale,
// and then the row shows that page's summary instead of job.description.
export async function WorkList({ dict, items }: { dict: Dictionary; items: Job[] }) {
  const { locale } = dict;
  const pages = await getExperienceLinks(locale);

  return (
    <ol className="log">
      {items.map((job) => {
        const summary = job.slug ? pages.get(job.slug) : undefined;
        return (
          <li key={`${job.org}-${job.when}`}>
            <span className="when">{job.when}</span>
            <div>
              <h3>
                {summary !== undefined ? (
                  <a href={`${EXPERIENCE_PATH[locale]}/${job.slug}`}>{job.role}</a>
                ) : (
                  job.role
                )}{" "}
                <span className="org">· {job.orgHref ? <a href={job.orgHref}>{job.org}</a> : job.org}</span>
              </h3>
              <p>{summary ?? job.description}</p>
              {job.where && <span className="where">{job.where}</span>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
