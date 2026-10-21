export type Locale = "pt" | "en";

export type StackGroupIcon = "llm" | "front" | "back" | "automation";
export type ContactIcon = "linkedin" | "instagram" | "github" | "whatsapp" | "email";

export interface Project {
  slug: string;
  name: string;
  role: string;
  highlightRole?: boolean;
  period: string;
  metric: string;
  metricLabel: string;
  result: string;
  stack: string[];
  href: string;
}

export interface Job {
  company: string;
  role: string;
  period: string;
  current?: boolean;
  result: string;
}

export interface Principle {
  title: string;
  description: string;
}

export interface StackGroup {
  icon: StackGroupIcon;
  name: string;
  items: string[];
}

export interface Contact {
  icon: ContactIcon;
  label: string;
  value: string;
  href: string;
}

export interface Dictionary {
  locale: Locale;
  meta: { title: string; description: string };
  nav: { links: { label: string; href: string }[] };
  hero: {
    greeting: string;
    titleLine1: string;
    titleLine2: string;
    value: string;
    thesisComment: string;
    thesis: string;
    cta: string;
    photoAlt: string;
  };
  availability: {
    items: { label: string; value: string }[];
    status: { label: string; online: string; offline: string; hours: string };
  };
  projects: { title: string; path: string; sub: string; cta: string; items: Project[] };
  experience: {
    title: string;
    path: string;
    sub: string;
    columns: { company: string; role: string; period: string; result: string };
    items: Job[];
  };
  principles: { title: string; path: string; sub: string; items: Principle[] };
  stack: { title: string; path: string; sub: string; groups: StackGroup[] };
  about: {
    title: string;
    path: string;
    paragraphs: [string, string];
    stats: { value: string; label: string }[];
  };
  contact: {
    title: string;
    path: string;
    items: Contact[];
    cvLabel: string;
    cvUpdated: string;
  };
  marquee: string;
  links: {
    meta: { title: string; description: string };
    portfolio: string;
    work: string;
    mentoring: string;
    soon: string;
  };
}
