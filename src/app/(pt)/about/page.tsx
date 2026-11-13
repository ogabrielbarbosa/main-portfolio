import type { Metadata } from "next";
import { AboutPage } from "@/components/AboutPage";
import { pt } from "@/content/pt";
import { pageMetadata } from "@/content/seo";
import { ABOUT_PATH } from "@/content/shared";

export const metadata: Metadata = pageMetadata({
  locale: "pt",
  paths: ABOUT_PATH,
  title: pt.about.meta.title,
  description: pt.about.meta.description,
});

export default function Page() {
  return <AboutPage dict={pt} />;
}
