import { EXPERIENCE_PATH } from "@/content/shared";
import type { Dictionary } from "@/content/types";
import { Shell } from "./Shell";
import { WorkList } from "./WorkList";

// Full work history (/experience, /en/experience); the home only shows the newest jobs.
// Same structure as the home section, so rows keep the home's spacing.
export function WorkPage({ dict }: { dict: Dictionary }) {
  const { work, locale } = dict;

  return (
    <Shell dict={dict} current={EXPERIENCE_PATH[locale]}>
      <h1 className="page-title">{work.title}</h1>
      <WorkList dict={dict} items={work.items} />
    </Shell>
  );
}
