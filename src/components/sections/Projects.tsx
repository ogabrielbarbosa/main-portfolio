import { ArrowUpRight } from "lucide-react";
import { SECTION_IDS } from "@/content/shared";
import type { Dictionary } from "@/content/types";
import { Crosshair, Frame, SectionHeader, Tag } from "../ui";

export function Projects({ dict }: { dict: Dictionary }) {
  const { projects } = dict;

  return (
    <Frame id={SECTION_IDS.projects}>
      <SectionHeader index="02" path={projects.path} title={projects.title} sub={projects.sub} />

      <div className="grid gap-px bg-line lg:grid-cols-3">
        {projects.items.map((project, i) => (
          <article
            key={project.slug}
            className="group relative flex flex-col gap-7 bg-canvas px-5 pt-8 pb-9 transition-colors hover:bg-surface sm:px-8"
          >
            {i > 0 && <Crosshair className="hidden lg:block" />}

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">P/{String(i + 1).padStart(2, "0")}</span>
              <Tag label={project.role} highlight={project.highlightRole} />
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="font-pixel text-[30px]">{project.name}</h3>
              <span className="text-xs tracking-[1px] text-muted">{project.period}</span>
            </div>

            <div className="flex flex-col gap-1.5 border-y border-line py-5">
              <span className="text-[56px] leading-none font-extrabold tracking-[-2px]">{project.metric}</span>
              <span className="flex items-center gap-2 text-[13px] text-muted">
                <span aria-hidden className="size-1.5 shrink-0 bg-lime" />
                {project.metricLabel}
              </span>
            </div>

            <p className="text-sm leading-[1.6] text-soft">{project.result}</p>

            <ul className="flex flex-wrap gap-1.5">
              {project.stack.map((tech) => (
                <li key={tech}>
                  <Tag label={tech} />
                </li>
              ))}
            </ul>

            <a
              href={project.href}
              className="mt-auto flex w-fit items-center gap-2 text-xs font-bold tracking-[1px] transition-colors hover:text-lime"
            >
              {projects.cta}
              <ArrowUpRight
                aria-hidden
                className="size-3.5 text-lime transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </a>
          </article>
        ))}
      </div>
    </Frame>
  );
}
