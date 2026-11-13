import type { Metadata } from "next";
import { pt } from "@/content/pt";
import { fontVariables } from "../fonts";
import "../globals.css";
import { baseMetadata } from "@/content/seo";
import { Effects } from "@/components/effects/Effects";

export const metadata: Metadata = {
  ...baseMetadata,
  title: pt.meta.title,
  description: pt.meta.description,
};

// Before first paint: hide the page so it can assemble itself from bits (components/effects/pagebits.ts).
const ENTER = `if (!matchMedia("(prefers-reduced-motion: reduce)").matches) document.documentElement.classList.add("entering")`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: ENTER }} />
      </head>
      <body>
        <Effects />
        {children}
      </body>
    </html>
  );
}
