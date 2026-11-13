import type { Metadata } from "next";
import { WorkPage } from "@/components/WorkPage";
import { pt } from "@/content/pt";
import { pageMetadata } from "@/content/seo";
import { EXPERIENCE_PATH } from "@/content/shared";

export const metadata: Metadata = pageMetadata({
  locale: "pt",
  paths: EXPERIENCE_PATH,
  title: pt.work.meta.title,
  description: pt.work.meta.description,
});

export default function Page() {
  return <WorkPage dict={pt} />;
}
