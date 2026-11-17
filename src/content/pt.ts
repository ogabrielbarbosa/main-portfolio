import { EXPERIENCE_PATH, LINKS } from "./shared";
import type { Dictionary } from "./types";

export const pt: Dictionary = {
  locale: "pt",
  meta: {
    title: "Gabriel Barbosa",
    description:
      "Gabriel Barbosa é AI Engineer & Product Builder em São Paulo. Constrói produtos com IA que geram resultado de negócio.",
  },
  nav: [
    { label: "experiência", href: EXPERIENCE_PATH.pt },
    { label: "sobre mim", href: "/about" },
  ],
  intro: { name: "Gabriel Barbosa", photoAlt: "Gabriel Barbosa" },
  lede: {
    strong: "AI Engineer & Product Builder.",
    text: "Trabalho junto com empresas para desenhar produtos, testar ideias e gerar crescimento com estratégias orientadas a dados.",
  },
  kv: [
    { term: "tese", value: "Hoje todo mundo coda; pouca gente entende de negócio." },
    { term: "stack", value: "Next.js, React Native, Node, Postgres, Docker e Claude." },
  ],
  contacts: [
    { icon: "linkedin", label: "linkedin", ...LINKS.linkedin },
    { icon: "instagram", label: "instagram", ...LINKS.instagram },
    { icon: "github", label: "github", ...LINKS.github },
    { icon: "whatsapp", label: "whatsapp", ...LINKS.whatsapp },
    { icon: "email", label: "email", ...LINKS.email },
  ],
  work: {
    title: "Experiência",
    items: [
      {
        when: "2025 – 2026",
        role: "Software Engineer",
        org: "LíderHub",
        orgHref: "https://liderhub.ai/",
        slug: "liderhub",
        description:
          "Ajudei a reconstruir o produto de uma startup de CRM com IA para advocacia, a manter o app de pé e a orquestrar o time de dev.",
        where: "Tempo integral · Híbrido · Londrina, PR",
      },
      {
        when: "2023",
        role: "Desenvolvedor Bubble Pleno",
        org: "Kafé Apps",
        slug: "kafe-apps",
        orgHref: "https://www.kafeapps.com.br/",
        description: "Desenvolvedor Bubble numa software house, tocando três projetos de clientes ao mesmo tempo.",
        where: "Tempo integral · Remoto · Rio de Janeiro",
      },
      {
        when: "2023",
        role: "Software Engineer",
        org: "Superior Digital",
        slug: "superior-digital",
        orgHref: "https://www.svperior.com/",
        description:
          "Construí em React Native o app de um hospital para o médico fazer videochamada com o paciente internado e registrar o estado dele no prontuário.",
        where: "Tempo integral · Remoto · EUA",
      },
      {
        when: "2021",
        role: "Desenvolvedor de Software",
        org: "Univap Centro",
        slug: "univap",
        orgHref: "https://www.univap.br/colegios/unidade-centro",
        description:
          "Criamos do zero o sistema de ocorrências da escola: o professor registra pelo celular e a orientação vê na hora, com o histórico do aluno. Valeu como TCC, projeto de pesquisa e estágio.",
        where: "Estágio · Híbrido · São José dos Campos, SP",
      },
    ],
    more: { label: "Histórico completo", href: EXPERIENCE_PATH.pt },
    meta: {
      title: "Experiência — Gabriel Barbosa",
      description: "Todas as experiências de Gabriel Barbosa como engenheiro de software, do estágio à LíderHub.",
    },
  },
  projects: {
    title: "Projetos",
    empty: "Projetos chegando em breve.",
    items: [
      {
        slug: "no-code-to-react-rebuild",
        name: "Chat",
        org: "LíderHub",
        experience: "liderhub",
        description: "Construí o chat inteiro em React + Supabase, lancei em ~5 semanas e cortei os bugs urgentes de 20 para 1 por semana.",
      },
      {
        slug: "chat-message-search",
        name: "Otimização da busca de mensagens",
        org: "LíderHub",
        experience: "liderhub",
        description: "Reescrevi a busca de mensagens e a navegação até o resultado: ~4x mais rápida (~5,3 s → ~1,3 s) com o banco ~4x maior.",
      },
      {
        slug: "support-tickets-incidents",
        name: "Sistema de tickets",
        org: "LíderHub",
        experience: "liderhub",
        description: "Construí o suporte dentro da plataforma, com tickets e incidentes: 20 mil+ atendidos e ~40% menos tickets por cliente.",
      },
      // Escondido por enquanto (status: draft no MDX).
      // {
      //   slug: "realtime-cost-95",
      //   name: "Otimização do banco e realtime",
      //   org: "LíderHub",
      //   experience: "liderhub",
      //   description: "Otimizei o banco e o WebSocket do Supabase e cortei 95% do tráfego realtime sem parar a produção.",
      // },
      {
        slug: "dev-process",
        name: "Processo de desenvolvimento",
        org: "LíderHub",
        experience: "liderhub",
        description: "Levei as tarefas do Notion para o GitHub Projects, padronizei issues e PRs e conduzi 100+ deploys.",
      },
      {
        slug: "onboarding-first-steps",
        name: "Redesenho do onboarding",
        org: "LíderHub",
        experience: "liderhub",
        description: "Redesenhei o primeiro acesso da plataforma: semanas com 90%+ dos clientes novos aceitando os termos e agendando a call.",
      },
    ],
  },
  caseStudy: {
    back: "voltar",
    metrics: "Resultados",
    stack: "stack",
    before: "antes",
    after: "depois",
    now: "hoje",
  },
  experience: { results: "Resultados", photos: "Fotos", projects: "Projetos",
    viewer: { prev: "Foto anterior", next: "Próxima foto", close: "Fechar" },
  },
  about: {
    meta: {
      title: "Sobre mim — Gabriel Barbosa",
      description: "Quem é o Gabriel Barbosa, no que ele acredita e com o que ele constrói.",
    },
    title: "Sobre mim",
    paragraphs: [
      "Tenho 22 anos. Saí do ensino médio direto para o mercado digital, vendendo cursos, infoprodutos e landing pages. Vi como aquilo era poderoso e faturei mais de R$ 100 mil em 7 dias.",
      "Depois disso voltei para a tecnologia, a área em que eu tinha me formado, e me encontrei: um lugar onde dá para empreender e construir coisas rápido.",
      "Movido por curiosidade e paixão por resolver problemas, me capacitei rápido e virei engenheiro de automação com IA, ajudando empresas a simplificar operações com IA. Aprendo rápido, me adapto com naturalidade e rendo melhor em ambientes dinâmicos. Me dá um desafio que eu domino.",
    ],
    principlesTitle: "O que eu acredito",
    principles: [
      {
        title: "Give First, but learn to say no",
        description:
          "Ajudo antes de pedir qualquer coisa: é assim que as relações longas começam. Mas o foco é dizer não para quase tudo, porque muitas vezes é algo que a própria pessoa consegue resolver sozinha. É assim que eu vejo como formar bons colaboradores e bons colegas de equipe.",
      },
      {
        title: "KISS — Keep it Simple, Stupid",
        description:
          "Todo mundo fala em pensar grande. Eu realmente penso, mas, na hora de decidir um projeto, pensar no simples e no mais rápido é melhor e mais eficiente. Uma arquitetura de sistema, uma automação ou um processo simples é muito mais fácil de manter e de melhorar. As visões grandes precisam ser simples e só funcionam de verdade em pequenos passos.",
      },
      {
        title: "DRY — Don't repeat yourself",
        description:
          "Existem vários jeitos de construir um produto: o fácil, o rápido e o eficiente. Quem pensa no curto prazo só quer entregar aquela tarefa e não pensa em realmente manter o produto. Eu foco em fluxos e estruturas pequenas que vão facilitar a vida de quem chegar depois. Nada de código bagunçado, elemento perdido ou design repetitivo. A gente constrói elementos reutilizáveis, com estruturas próprias, de um jeito organizado e inteligente.",
      },
      {
        title: "Do things that don't scale",
        description:
          "Os primeiros clientes são atendidos na mão, um a um. É ali que se aprende o que o produto precisa ser.",
      },
    ],
    stackTitle: "Stack",
    stack: [
      {
        name: "ia / llm",
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
      { name: "automação", items: ["n8n", "Make", "Apify"] },
    ],
  },
};
