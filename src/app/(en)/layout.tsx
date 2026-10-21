import type { Metadata } from "next";
import { en } from "@/content/en";
import { fontVariables } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: en.meta.title,
  description: en.meta.description,
  alternates: { languages: { "pt-BR": "/" } },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontVariables} antialiased`}>
      <body className="min-h-dvh font-mono">{children}</body>
    </html>
  );
}
