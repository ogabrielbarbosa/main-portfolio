import type { Metadata } from "next";
import { HomePage } from "@/components/HomePage";
import { pt } from "@/content/pt";
import { HOME_PATH } from "@/content/shared";
import { pageMetadata } from "@/content/seo";

export const metadata: Metadata = pageMetadata({
  locale: "pt",
  paths: HOME_PATH,
  title: pt.meta.title,
  description: pt.meta.description,
  type: "profile",
});

export default function Page() {
  return <HomePage dict={pt} />;
}
