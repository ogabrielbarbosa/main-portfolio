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
          "CRM com IA para escritórios de advocacia. Reconstruí o chat fora do no-code (bugs urgentes de 20 para 1 por semana), cortei ~95% do tráfego realtime, criei o sistema de tickets (20 mil+ atendidos) e redesenhei o onboarding enquanto a base crescia ~5x.",
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
          "App mobile em React Native para um hospital: o médico faz videochamada com o paciente internado e registra o estado dele no prontuário.",
        where: "Tempo integral · Remoto · EUA",
      },
      {
        when: "2021",
        role: "Desenvolvedor de Software",
        org: "Univap Centro",
        slug: "univap",
        orgHref: "https://www.univap.br/colegios/unidade-centro",
        description:
          "Sistema de ocorrências da escola feito do zero: o professor registra pelo celular e a orientação vê na hora. Valeu como TCC e estágio.",
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
    results: "Resultados",
    contributions: "Minhas contribuições",
    cases: "Cases",
    items: [
      {
        slug: "liderhub",
        when: "2025 – 2026",
        name: "LíderHub",
        href: "https://liderhub.ai/",
        tagline: "CRM com IA para advocacia",
        description:
          "CRM com inteligência artificial que ajuda advogados a fecharem contratos.",
        about: [
          "Agentes de IA conversam com os clientes do escritório pelo WhatsApp e ajudam a fechar e gerenciar os contratos. A equipe acompanha tudo no app: chat, busca, kanban e contatos.",
          "Entrei quando o produto tinha cerca de 150 clientes e saí com mais de 1.200. Nesse meio tempo ajudei a reconstruir o app inteiro, mantive ele de pé e ajudei a orquestrar a equipe de dev.",
        ],
        results: [
          "Base de clientes: de ~150 para 1.200+",
          "Segunda versão do app reconstruída fora do no-code, em React + Supabase",
          "Bugs urgentes de 20 para 1 por semana e ~95% menos tráfego realtime",
          "Suporte dentro da plataforma: 20 mil+ tickets atendidos",
        ],
        contributions: [
          { title: "Reconstrução do app.", text: "Tirei do no-code todo o sistema de atendimento (chat, mensagens, busca, kanban e contatos) e lançamos a nova versão em ~5 semanas." },
          { title: "Manutenção.", text: "Mantive o app de pé enquanto a base crescia: achei a causa do tráfego realtime explodindo e cortei 95% dos eventos sem parar a produção." },
          { title: "Suporte.", text: "Levei o suporte do WhatsApp e do Notion para dentro da plataforma, com tickets rastreáveis e incidentes com dono." },
          { title: "Onboarding.", text: "Transformei um banner escondido num primeiro acesso guiado, com aceite dos termos e agendamento da call." },
          { title: "Equipe.", text: "Levei as tarefas para o GitHub Projects, padronizei issues e PRs e passei a conduzir a daily e os deploys." },
        ],
        milestones: [
          {
            slug: "no-code-to-react-rebuild",
            text: "Tirei o chat do no-code, lancei em ~5 semanas e cortei os bugs urgentes de 20 para 1 por semana.",
          },
          {
            slug: "support-tickets-incidents",
            text: "Criei o sistema de tickets e incidentes: 20 mil+ atendidos e ~40% menos tickets por cliente.",
          },
          {
            slug: "realtime-cost-95",
            text: "Cortei ~95% do tráfego realtime sem parar a produção.",
          },
          {
            slug: "dev-process",
            text: "Organizei o processo de dev no GitHub Projects e conduzi 100+ deploys.",
          },
          {
            slug: "onboarding-first-steps",
            text: "Redesenhei o primeiro acesso: ~94% dos clientes novos aceitando os termos.",
          },
        ],
      },
    ],
  },
  caseStudy: {
    back: "voltar",
    metrics: "Resultados",
    evidence: "Evidências",
    stack: "stack",
    before: "antes",
    after: "depois",
    now: "hoje",
  },
  experience: { results: "Resultados", photos: "Fotos", project: "Projeto vinculado",
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
