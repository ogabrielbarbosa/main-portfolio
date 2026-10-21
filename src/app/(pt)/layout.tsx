import type { Metadata } from "next";
import { pt } from "@/content/pt";
import { fontVariables } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: pt.meta.title,
  description: pt.meta.description,
  alternates: { languages: { en: "/en" } },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${fontVariables} antialiased`}>
      <body className="min-h-dvh font-mono">{children}</body>
    </html>
  );
}
