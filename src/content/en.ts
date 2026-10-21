import { LINKS, SECTION_IDS } from "./shared";
import type { Dictionary } from "./types";

// TODO: projects, metrics and experience are still the design placeholders.
export const en: Dictionary = {
  locale: "en",
  meta: {
    title: "Gabriel Barbosa — AI Engineer & Product Builder",
    description: "I build AI products that drive business results.",
  },
  nav: {
    links: [
      { label: "PROJECTS", href: `#${SECTION_IDS.projects}` },
      { label: "EXPERIENCE", href: `#${SECTION_IDS.experience}` },
      { label: "CONTACT", href: `#${SECTION_IDS.contact}` },
    ],
  },
  hero: {
    greeting: "Hi, I'm Gabriel!",
    titleLine1: "AI ENGINEER",
    titleLine2: "PRODUCT BUILDER",
    value: "I build AI products that drive business results.",
    thesisComment: "// thesis",
    thesis: "Everyone codes now; few people understand business.",
    cta: "LEARN MORE",
    photoAlt: "Photo of Gabriel Barbosa",
  },
  availability: {
    items: [
      { label: "LANGUAGE", value: "Portuguese — Native" },
      { label: "LANGUAGE", value: "English — Advanced" },
      { label: "TIMEZONE", value: "GMT-3 · São Paulo" },
    ],
    status: {
      label: "STATUS",
      online: "Online",
      offline: "Off",
      hours: "hustler mode: 7am – 9pm",
    },
  },
  projects: {
    title: "PROJECTS",
    path: "~/gabriel/projects",
    sub: "Products I built or helped build — and what they moved for the business.",
    cta: "VIEW CASE",
    items: [
      {
        slug: "plinai",
        name: "PLINAI",
        role: "FOUNDER",
        highlightRole: true,
        period: "2024 — NOW",
        metric: "+3,000",
        metricLabel: "active users in 6 months",
        result:
          "AI agent platform for SMBs. From zero to product-market fit with no outside funding.",
        stack: ["NEXT.JS", "OPENAI", "SUPABASE", "N8N"],
        href: "#",
      },
      {
        slug: "despencou",
        name: "DESPENCOU",
        role: "AI ENGINEER",
        period: "2023 — 2024",
        metric: "-62%",
        metricLabel: "support cost",
        result: "LLM pipeline that automated support triage and replies at scale, 24/7.",
        stack: ["PYTHON", "LANGCHAIN", "POSTGRES", "AWS"],
        href: "#",
      },
      {
        slug: "lanabiel",
        name: "LANABIEL",
        role: "FREELANCE",
        period: "2022 — 2023",
        metric: "3.4x",
        metricLabel: "e-commerce conversion",
        result: "Redesign + AI recommendation engine for an independent fashion brand.",
        stack: ["REACT", "SHOPIFY", "CLAUDE", "FIGMA"],
        href: "#",
      },
    ],
  },
  experience: {
    title: "EXPERIENCE",
    path: "~/gabriel/experience",
    sub: "Where I worked, what I did and the result that stuck.",
    columns: { company: "COMPANY", role: "ROLE", period: "PERIOD", result: "RESULT" },
    items: [
      {
        company: "PLINAI",
        role: "Founder & AI Engineer",
        period: "2024 — Now",
        current: true,
        result: "AI product with 3k+ users and recurring revenue since month 4.",
      },
      {
        company: "DESPENCOU",
        role: "AI Engineer",
        period: "2023 — 2024",
        result: "LLM support automation: -62% cost and SLA from 4h to 5min.",
      },
      {
        company: "LANABIEL",
        role: "Product Builder · Freelance",
        period: "2022 — 2023",
        result: "3.4x higher conversion after redesign and recommendation engine.",
      },
    ],
  },
  principles: {
    title: "WHAT I\nBELIEVE",
    path: "~/gabriel/principles",
    sub: "Five rules that guide how I decide, build and work with people.",
    items: [
      {
        title: "Give First, but learn to say no",
        description:
          "I help before asking for anything — that's how long relationships start.\nBut focus means saying no to almost everything.",
      },
      {
        title: "KISS — Keep it Simple, Stupid",
        description:
          "The simplest solution that solves the problem wins.\nComplexity is a cost someone pays later.",
      },
      {
        title: "DRY — Don't repeat yourself",
        description:
          "If I did it twice, it becomes a function, template or automation.\nMy time goes to what's new.",
      },
      {
        title: "Do things that don't scale",
        description:
          "The first customers are served by hand, one by one.\nThat's where you learn what the product needs to be.",
      },
      {
        title: "10-year goals",
        description:
          "I decide today by looking at where I want to be in a decade.\nPatience in the long run, urgency in the short run.",
      },
    ],
  },
  stack: {
    title: "STACK & TOOLS",
    path: "~/gabriel/stack-tools",
    sub: "What I use day to day to get products off the ground.",
    groups: [
      { icon: "llm", name: "AI / LLM", items: ["OpenAI API", "Claude", "LangChain", "RAG · pgvector", "Whisper"] },
      { icon: "front", name: "FRONT / MOBILE", items: ["Next.js", "React", "React Native", "Tailwind", "TypeScript"] },
      { icon: "back", name: "BACK / DATA", items: ["Node.js", "Python", "Supabase", "Postgres", "Redis"] },
      { icon: "automation", name: "AUTOMATION", items: ["n8n", "Make", "Zapier", "Apify", "Webhooks"] },
    ],
  },
  about: {
    title: "ABOUT ME",
    path: "~/gabriel/about",
    paragraphs: [
      "I'm an AI engineer and product builder. I was selling before I was coding — and that changed how I build: first the problem and the metric, then the code.",
      "Over the last few years I've launched my own products, led AI at a startup and served clients as a freelancer. I like small teams, short cycles and people who measure what they do.",
    ],
    stats: [
      { value: "4+", label: "years building" },
      { value: "12", label: "products shipped" },
      { value: "3", label: "companies" },
    ],
  },
  contact: {
    title: "SEND ME A MESSAGE",
    path: "~/gabriel/contact",
    items: [
      { icon: "linkedin", label: "LINKEDIN", ...LINKS.linkedin },
      { icon: "instagram", label: "INSTAGRAM", ...LINKS.instagram },
      { icon: "github", label: "GITHUB", ...LINKS.github },
      { icon: "whatsapp", label: "WHATSAPP", ...LINKS.whatsapp },
      { icon: "email", label: "EMAIL", ...LINKS.email },
    ],
    cvLabel: "RESUME",
    cvUpdated: "PDF · updated oct 2026",
  },
  marquee: "GABRIEL BARBOSA",
  links: {
    meta: {
      title: "Gabriel Barbosa — Links",
      description: "Contacts and links for Gabriel Barbosa, AI Engineer & Product Builder.",
    },
    portfolio: "PORTFOLIO",
    work: "WORK WITH ME AT LÍDERHUB",
    mentoring: "1:1 MENTORING",
    soon: "COMING SOON",
  },
};
