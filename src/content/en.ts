import { EXPERIENCE_PATH, LINKS } from "./shared";
import type { Dictionary } from "./types";

export const en: Dictionary = {
  locale: "en",
  meta: {
    title: "Gabriel Barbosa",
    description:
      "Gabriel Barbosa is an AI Engineer & Product Builder in São Paulo. He builds AI products that drive business results.",
  },
  nav: [
    { label: "work", href: EXPERIENCE_PATH.en },
    { label: "about", href: "/en/about" },
  ],
  intro: { name: "Gabriel Barbosa", photoAlt: "Gabriel Barbosa" },
  lede: {
    strong: "AI Engineer & Product Builder.",
    text: "I partner with businesses to design products, test ideas, and drive growth using data-driven strategies.",
  },
  kv: [
    { term: "thesis", value: "Everyone codes now; few people understand business." },
    { term: "stack", value: "Next.js, React Native, Node, Postgres, Docker and Claude." },
  ],
  contacts: [
    { icon: "linkedin", label: "linkedin", ...LINKS.linkedin },
    { icon: "instagram", label: "instagram", ...LINKS.instagram },
    { icon: "github", label: "github", ...LINKS.github },
    { icon: "whatsapp", label: "whatsapp", ...LINKS.whatsapp },
    { icon: "email", label: "email", ...LINKS.email },
  ],
  work: {
    title: "Work",
    items: [
      {
        when: "2025 – 2026",
        role: "Software Engineer",
        org: "LíderHub",
        orgHref: "https://liderhub.ai/",
        slug: "liderhub",
        description:
          "Helped rebuild the product of an AI CRM startup for law firms, keep the app running and orchestrate the dev team.",
        where: "Full-time · Hybrid · Londrina, Brazil",
      },
      {
        when: "2023",
        role: "Mid-level Bubble Developer",
        org: "Kafé Apps",
        slug: "kafe-apps",
        orgHref: "https://www.kafeapps.com.br/",
        description: "Bubble developer at a software house, running three client projects at the same time.",
        where: "Full-time · Remote · Rio de Janeiro",
      },
      {
        when: "2023",
        role: "Software Engineer",
        org: "Superior Digital",
        slug: "superior-digital",
        orgHref: "https://www.svperior.com/",
        description:
          "Built a hospital's React Native app so doctors could video call admitted patients and record their condition in the medical record.",
        where: "Full-time · Remote · USA",
      },
      {
        when: "2021",
        role: "Software Developer",
        org: "Univap Centro",
        slug: "univap",
        orgHref: "https://www.univap.br/colegios/unidade-centro",
        description:
          "We built the school's incident system from scratch: teachers log incidents on their phone and the counselor sees them instantly, with the student's history. It counted as our final project, research project and internship.",
        where: "Internship · Hybrid · São José dos Campos, Brazil",
      },
    ],
    more: { label: "Full history", href: EXPERIENCE_PATH.en },
    meta: {
      title: "Work — Gabriel Barbosa",
      description: "Gabriel Barbosa's full work history as a software engineer, from internship to LíderHub.",
    },
  },
  projects: {
    title: "Projects",
    empty: "Projects coming soon.",
    items: [
      {
        slug: "no-code-to-react-rebuild",
        name: "Chat",
        org: "LíderHub",
        experience: "liderhub",
        description: "Built the whole chat in React + Supabase, shipped it in ~5 weeks and cut urgent bugs from 20 to 1 a week.",
      },
      {
        slug: "chat-message-search",
        name: "Message search optimization",
        org: "LíderHub",
        experience: "liderhub",
        description: "Rewrote message search and the navigation to each result: ~4x faster (~5.3 s → ~1.3 s) on a ~4x bigger database.",
      },
      {
        slug: "support-tickets-incidents",
        name: "Ticket system",
        org: "LíderHub",
        experience: "liderhub",
        description: "Built support inside the platform, with tickets and incidents: 20k+ handled and ~40% fewer tickets per customer.",
      },
      // Escondido por enquanto (status: draft no MDX).
      // {
      //   slug: "realtime-cost-95",
      //   name: "Database and realtime optimization",
      //   org: "LíderHub",
      //   experience: "liderhub",
      //   description: "Optimized the database and Supabase's WebSocket and cut 95% of realtime traffic without stopping production.",
      // },
      {
        slug: "dev-process",
        name: "Development process",
        org: "LíderHub",
        experience: "liderhub",
        description: "Moved tasks from Notion to GitHub Projects, standardized issues and PRs and led 100+ deploys.",
      },
      {
        slug: "onboarding-first-steps",
        name: "Onboarding redesign",
        org: "LíderHub",
        experience: "liderhub",
        description: "Redesigned the platform's first access: weeks with 90%+ of new customers accepting the terms and booking the call.",
      },
    ],
  },
  caseStudy: {
    back: "back",
    metrics: "Results",
    stack: "stack",
    before: "before",
    after: "after",
    now: "now",
  },
  experience: { results: "Results", photos: "Photos", projects: "Projects",
    viewer: { prev: "Previous photo", next: "Next photo", close: "Close" },
  },
  about: {
    meta: {
      title: "About — Gabriel Barbosa",
      description: "Who Gabriel Barbosa is, what he believes and what he builds with.",
    },
    title: "About me",
    paragraphs: [
      "I'm 22. Right out of high school I went into digital marketing, selling online courses, info products and landing pages. I saw how powerful it was and did over R$100k in sales in 7 days.",
      "After that I went back to tech, the field I had trained in, and found my place: somewhere I could build a business and ship things fast.",
      "Driven by curiosity and a passion for solving problems, I quickly upskilled myself and became an AI automation engineer, helping companies streamline operations through AI. I'm a fast learner and a natural adapter, and I thrive in dynamic environments. Give me a challenge and I'll master it.",
    ],
    principlesTitle: "What I believe",
    principles: [
      {
        title: "Give First, but learn to say no",
        description:
          "I help before asking for anything: that's how long relationships start. But the focus is saying no to almost everything, because a lot of the time it's something the person can solve on their own. That's how I see training good collaborators and good teammates.",
      },
      {
        title: "KISS — Keep it Simple, Stupid",
        description:
          "Everyone talks about thinking big. I really do, but when it comes to deciding on a project, thinking simple and fastest is better and more efficient. A simple system architecture, automation or process is much easier to maintain and improve. Big visions need to be simple, and they only really work in small steps.",
      },
      {
        title: "DRY — Don't repeat yourself",
        description:
          "There are many ways to build a product: the easy way, the fast way and the efficient way. People who think short-term just want to deliver that one task and don't really think about maintaining the product. I focus on small flows and structures that make life easier for whoever comes next. No messy code, stray elements or repetitive design. We build reusable elements with their own structure, in an organized and smart way.",
      },
      {
        title: "Do things that don't scale",
        description:
          "The first customers are served by hand, one by one. That's where you learn what the product needs to be.",
      },
    ],
    stackTitle: "Stack",
    stack: [
      {
        name: "ai / llm",
        items: ["OpenAI API", "Claude", "LangChain", "RAG · pgvector"],
      },
      {
        name: "front",
        items: ["Next.js", "React", "React Native", "Tailwind", "TypeScript"],
      },
      {
        name: "back",
        items: ["Node.js", "Python", "Supabase", "Postgres", "Redis", "Docker"],
      },
      { name: "automation", items: ["n8n", "Make", "Apify"] },
    ],
  },
};
