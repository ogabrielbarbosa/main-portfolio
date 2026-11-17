export type Locale = "pt" | "en";

export type ContactIcon = "linkedin" | "instagram" | "github" | "whatsapp" | "email";

export interface Contact {
  icon: ContactIcon;
  label: string;
  value: string;
  href: string;
}

export interface Job {
  when: string;
  role: string;
  org: string;
  orgHref?: string;
  description: string;
  where?: string;
  // Has a page at /experience/<slug> (content/experience/<slug>).
  slug?: string;
}

// A project on the home, backed by a STAR case at CASE_PATH/<slug> (content/star/<slug>).
export interface Project {
  slug: string;
  name: string;
  org: string;
  // Experience slug it belongs to; that experience page lists it.
  experience?: string;
  description: string;
}

export interface Dictionary {
  locale: Locale;
  meta: { title: string; description: string };
  nav: { label: string; href: string }[];
  intro: { name: string; photoAlt: string };
  // Bold opening of the lede, then the muted rest.
  lede: { strong: string; text: string };
  kv: { term: string; value: string }[];
  contacts: Contact[];
  // Home shows the newest jobs; the full list lives at EXPERIENCE_PATH.
  work: {
    title: string;
    items: Job[];
    more: { label: string; href: string };
    meta: { title: string; description: string };
  };
  // What I built, one row per STAR case.
  projects: {
    title: string;
    empty: string;
    items: Project[];
  };
  caseStudy: {
    back: string;
    metrics: string;
    stack: string;
    before: string;
    after: string;
    now: string;
  };
  experience: {
    results: string;
    photos: string;
    projects: string;
    viewer: { prev: string; next: string; close: string };
  };
  about: {
    meta: { title: string; description: string };
    title: string;
    paragraphs: string[];
    principlesTitle: string;
    principles: { title: string; description: string }[];
    stackTitle: string;
    stack: { name: string; items: string[] }[];
  };
}
