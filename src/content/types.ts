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

// A project page lives at CASE_PATH/<slug>, next to its milestones' cases.
export interface Project {
  slug: string;
  when: string;
  name: string;
  href?: string;
  tagline: string;
  description: string;
  // Longer explanation, one string per paragraph, shown on the project page.
  about?: string[];
  results?: string[];
  // "**Title.** text" bullets: title in bold, then what I did.
  contributions?: { title: string; text: string }[];
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
  projects: {
    title: string;
    empty: string;
    results: string;
    contributions: string;
    cases: string;
    items: Project[];
  };
  caseStudy: {
    back: string;
    metrics: string;
    evidence: string;
    stack: string;
    before: string;
    after: string;
    now: string;
  };
  experience: {
    results: string;
    photos: string;
    project: string;
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
