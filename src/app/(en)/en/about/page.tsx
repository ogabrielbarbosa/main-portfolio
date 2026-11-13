import type { Metadata } from "next";
import { AboutPage } from "@/components/AboutPage";
import { en } from "@/content/en";
import { pageMetadata } from "@/content/seo";
import { ABOUT_PATH } from "@/content/shared";

export const metadata: Metadata = pageMetadata({
  locale: "en",
  paths: ABOUT_PATH,
  title: en.about.meta.title,
  description: en.about.meta.description,
});

export default function Page() {
  return <AboutPage dict={en} />;
}
