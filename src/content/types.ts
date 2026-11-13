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

// A milestone inside a project, linking to its STAR case (content/star/<slug>).
export interface Milestone {
  slug: string;
  text: string;
}

export interface Project {
  when: string;
  name: string;
  href?: string;
  tagline: string;
  description: string;
  milestones?: Milestone[];
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
  // Products I built or helped build; milestones link to the STAR cases.
  projects: { title: string; empty: string; items: Project[] };
  caseStudy: {
    back: string;
    metrics: string;
    evidence: string;
    stack: string;
    before: string;
    after: string;
    now: string;
  };
  experience: { results: string; photos: string; cases: string };
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
