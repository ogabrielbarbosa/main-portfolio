import type { Metadata } from "next";
import { LinksPage } from "@/components/LinksPage";
import { pt } from "@/content/pt";

export const metadata: Metadata = {
  title: pt.links.meta.title,
  description: pt.links.meta.description,
};

export default function Page() {
  return <LinksPage dict={pt} />;
}
