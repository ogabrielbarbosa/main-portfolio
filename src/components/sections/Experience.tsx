import { SECTION_IDS } from "@/content/shared";
import type { Dictionary } from "@/content/types";
import { Frame, LiveDot, SectionHeader } from "../ui";

const COLUMNS = "lg:grid-cols-[72px_260px_280px_200px_1fr]";

export function Experience({ dict }: { dict: Dictionary }) {
  const { experience } = dict;
  const { columns } = experience;

  return (
    <Frame id={SECTION_IDS.experience}>
      <SectionHeader index="03" path={experience.path} title={experience.title} sub={experience.sub} />

      <div
        aria-hidden
        className={`hidden border-b border-line bg-surface text-[11px] tracking-[1px] text-muted lg:grid ${COLUMNS} [&>span]:px-6 [&>span]:py-3.5`}
      >
        <span>#</span>
        <span>{columns.company}</span>
        <span>{columns.role}</span>
        <span>{columns.period}</span>
        <span>{columns.result}</span>
      </div>

      <ol className="divide-y divide-line">
        {experience.items.map((job, i) => (
          <li
            key={job.company}
            className={`grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-2 px-5 py-6 sm:px-10 lg:gap-0 lg:p-0 ${COLUMNS} lg:[&>*]:px-6 lg:[&>*]:py-7`}
          >
            <span className="text-xs text-muted">{String(i + 1).padStart(2, "0")}</span>
            <span className="font-pixel text-lg">{job.company}</span>
            <span className="col-span-2 text-sm font-semibold lg:col-span-1">{job.role}</span>
            <span className="col-span-2 flex items-center gap-2.5 text-sm text-muted lg:col-span-1">
              {job.period}
              {job.current && <LiveDot />}
            </span>
            <p className="col-span-2 text-sm leading-[1.5] text-soft lg:col-span-1">{job.result}</p>
          </li>
        ))}
      </ol>
    </Frame>
  );
}
