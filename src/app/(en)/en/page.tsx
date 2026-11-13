import type { Metadata } from "next";
import { HomePage } from "@/components/HomePage";
import { en } from "@/content/en";
import { HOME_PATH } from "@/content/shared";
import { pageMetadata } from "@/content/seo";

export const metadata: Metadata = pageMetadata({
  locale: "en",
  paths: HOME_PATH,
  title: en.meta.title,
  description: en.meta.description,
  type: "profile",
});

export default function Page() {
  return <HomePage dict={en} />;
}
