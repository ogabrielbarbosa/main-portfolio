import type { Metadata } from "next";
import { WorkPage } from "@/components/WorkPage";
import { en } from "@/content/en";
import { pageMetadata } from "@/content/seo";
import { EXPERIENCE_PATH } from "@/content/shared";

export const metadata: Metadata = pageMetadata({
  locale: "en",
  paths: EXPERIENCE_PATH,
  title: en.work.meta.title,
  description: en.work.meta.description,
});

export default function Page() {
  return <WorkPage dict={en} />;
}
