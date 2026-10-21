import { LINKS, SECTION_IDS } from "./shared";
import type { Dictionary } from "./types";

// TODO: projetos, métricas e experiências ainda são os do design (placeholder).
export const pt: Dictionary = {
  locale: "pt",
  meta: {
    title: "Gabriel Barbosa — AI Engineer & Product Builder",
    description: "Eu construo produtos com IA que geram resultado de negócio.",
  },
  nav: {
    links: [
      { label: "PROJETOS", href: `#${SECTION_IDS.projects}` },
      { label: "EXPERIÊNCIA", href: `#${SECTION_IDS.experience}` },
      { label: "CONTATO", href: `#${SECTION_IDS.contact}` },
    ],
  },
  hero: {
    greeting: "Oi, eu sou o Gabriel!",
    titleLine1: "AI ENGINEER",
    titleLine2: "PRODUCT BUILDER",
    value: "Eu construo produtos com IA que geram resultado de negócio.",
    thesisComment: "// tese",
    thesis: "Hoje todo mundo coda; pouca gente entende de negócio.",
    cta: "SABER MAIS",
    photoAlt: "Foto de Gabriel Barbosa",
  },
  availability: {
    items: [
      { label: "IDIOMA", value: "Português — Nativo" },
      { label: "IDIOMA", value: "Inglês — Avançado" },
      { label: "FUSO", value: "GMT-3 · São Paulo" },
    ],
    status: {
      label: "STATUS",
      online: "Online",
      offline: "Off",
      hours: "hustler mode: 7am – 9pm",
    },
  },
  projects: {
    title: "PROJETOS",
    path: "~/gabriel/projetos",
    sub: "Produtos que eu construí ou ajudei a construir — e o que eles moveram no negócio.",
    cta: "VER CASE",
    items: [
      {
        slug: "plinai",
        name: "PLINAI",
        role: "FOUNDER",
        highlightRole: true,
        period: "2024 — HOJE",
        metric: "+3.000",
        metricLabel: "usuários ativos em 6 meses",
        result:
          "Plataforma de agentes de IA para PMEs. Do zero ao product-market fit sem investimento externo.",
        stack: ["NEXT.JS", "OPENAI", "SUPABASE", "N8N"],
        href: "#",
      },
      {
        slug: "despencou",
        name: "DESPENCOU",
        role: "AI ENGINEER",
        period: "2023 — 2024",
        metric: "-62%",
        metricLabel: "custo de atendimento",
        result:
          "Pipeline de LLM que automatizou triagem e respostas de suporte em escala, 24/7.",
        stack: ["PYTHON", "LANGCHAIN", "POSTGRES", "AWS"],
        href: "#",
      },
      {
        slug: "lanabiel",
        name: "LANABIEL",
        role: "FREELA",
        period: "2022 — 2023",
        metric: "3,4x",
        metricLabel: "conversão do e-commerce",
        result: "Redesign + motor de recomendação com IA para uma marca de moda autoral.",
        stack: ["REACT", "SHOPIFY", "CLAUDE", "FIGMA"],
        href: "#",
      },
    ],
  },
  experience: {
    title: "EXPERIÊNCIA",
    path: "~/gabriel/experiencia",
    sub: "Onde trabalhei, o que eu fazia e o resultado que ficou.",
    columns: { company: "EMPRESA", role: "CARGO", period: "PERÍODO", result: "RESULTADO" },
    items: [
      {
        company: "PLINAI",
        role: "Founder & AI Engineer",
        period: "2024 — Hoje",
        current: true,
        result: "Produto de IA com 3k+ usuários e receita recorrente desde o 4º mês.",
      },
      {
        company: "DESPENCOU",
        role: "AI Engineer",
        period: "2023 — 2024",
        result: "Automação de suporte com LLM: -62% no custo e SLA de 4h para 5min.",
      },
      {
        company: "LANABIEL",
        role: "Product Builder · Freela",
        period: "2022 — 2023",
        result: "Conversão 3,4x maior após redesign e motor de recomendação.",
      },
    ],
  },
  principles: {
    title: "O QUE EU\nACREDITO",
    path: "~/gabriel/principios",
    sub: "Cinco regras que guiam como eu decido, construo e trabalho com pessoas.",
    items: [
      {
        title: "Give First, mas saiba dizer não",
        description:
          "Ajudo antes de pedir qualquer coisa — é assim que relações longas começam.\nMas foco é dizer não para quase tudo.",
      },
      {
        title: "KISS — Keep it Simple, Stupid",
        description:
          "A solução mais simples que resolve o problema vence.\nComplexidade é um custo que alguém paga depois.",
      },
      {
        title: "DRY — Don't repeat yourself",
        description:
          "Se fiz duas vezes, vira função, template ou automação.\nMeu tempo vai para o que é novo.",
      },
      {
        title: "Faça coisas que não escalam",
        description:
          "Os primeiros clientes são atendidos na mão, um a um.\nÉ ali que se aprende o que o produto precisa ser.",
      },
      {
        title: "Metas de 10 anos",
        description:
          "Decido o hoje olhando para onde quero estar em uma década.\nPaciência no longo prazo, urgência no curto.",
      },
    ],
  },
  stack: {
    title: "STACK & FERRAMENTAS",
    path: "~/gabriel/stack-ferramentas",
    sub: "O que eu uso no dia a dia para tirar produto do papel.",
    groups: [
      { icon: "llm", name: "IA / LLM", items: ["OpenAI API", "Claude", "LangChain", "RAG · pgvector", "Whisper"] },
      { icon: "front", name: "FRONT / MOBILE", items: ["Next.js", "React", "React Native", "Tailwind", "TypeScript"] },
      { icon: "back", name: "BACK / DADOS", items: ["Node.js", "Python", "Supabase", "Postgres", "Redis"] },
      { icon: "automation", name: "AUTOMAÇÃO", items: ["n8n", "Make", "Zapier", "Apify", "Webhooks"] },
    ],
  },
  about: {
    title: "SOBRE MIM",
    path: "~/gabriel/sobre",
    paragraphs: [
      "Sou engenheiro de IA e builder de produto. Comecei vendendo antes de programar — e isso mudou como eu construo: primeiro o problema e a métrica, depois o código.",
      "Nos últimos anos lancei produtos próprios, liderei IA em startup e atendi clientes como freela. Gosto de times pequenos, ciclos curtos e gente que mede o que faz.",
    ],
    stats: [
      { value: "4+", label: "anos construindo" },
      { value: "12", label: "produtos lançados" },
      { value: "3", label: "empresas" },
    ],
  },
  contact: {
    title: "ME MANDA UMA MENSAGEM",
    path: "~/gabriel/contato",
    items: [
      { icon: "linkedin", label: "LINKEDIN", ...LINKS.linkedin },
      { icon: "instagram", label: "INSTAGRAM", ...LINKS.instagram },
      { icon: "github", label: "GITHUB", ...LINKS.github },
      { icon: "whatsapp", label: "WHATSAPP", ...LINKS.whatsapp },
      { icon: "email", label: "EMAIL", ...LINKS.email },
    ],
    cvLabel: "CURRÍCULO",
    cvUpdated: "PDF · atualizado em out 2026",
  },
  marquee: "GABRIEL BARBOSA",
};
