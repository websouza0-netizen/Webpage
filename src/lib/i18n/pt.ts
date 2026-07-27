import type { en } from "./en";

export const pt: typeof en = {
  nav: {
    features: "Recursos",
    pricing: "Preços",
    projects: "Projetos demo",
    faq: "Perguntas frequentes",
    login: "Entrar",
    signup: "Começar",
    dashboard: "Painel",
  },
  hero: {
    eyebrow: "A aceitar novos projetos",
    headingLead: "Um site que está",
    headingAccent: "sempre pronto",
    headingTail: ".",
    subtitle:
      "A WebSouza desenha, constrói e mantém o site do seu negócio — com pedidos de edição reais incluídos, não um modelo entregue e esquecido.",
    ctaPrimary: "Começar",
    ctaSecondary: "Ver projetos demo",
    stats: {
      plansLabel: "planos à escolha",
      freeEditsLabel: "edições grátis por período",
      extraEditLabel: "por edição extra",
    },
  },
  trustedBy: {
    title: "Feito para",
    categories: ["Hotelaria", "Criativo", "Serviços", "Retalho"],
  },
  features: {
    title: "Depois do lançamento, continuamos a cuidar",
    subtitle: "Uma subscrição de website que continua a funcionar depois de publicado.",
    items: [
      {
        title: "Design personalizado",
        description: "Um site desenhado à volta do seu negócio, não um modelo genérico.",
      },
      {
        title: "Lançamento rápido",
        description: "Do início ao site no ar em dias, não em meses.",
      },
      {
        title: "Edições incluídas",
        description: "Pedidos de edição grátis em cada período de faturação, sem novo projeto a cada vez.",
      },
      {
        title: "Alojamento e suporte",
        description: "Alojamento, disponibilidade e suporte fazem parte da subscrição, não são extras.",
      },
    ],
  },
  pricing: {
    title: "Preços simples e transparentes",
    subtitle: "Dois planos. Sem taxas de configuração. Cancele quando quiser.",
    monthly: "Mensal",
    annual: "Anual",
    perMonth: "mês",
    perYear: "ano",
    cta: "Começar",
  },
  projects: {
    title: "Veja a variedade",
    subtitle: "Seis projetos demo que mostram como desenhamos de forma diferente para negócios diferentes.",
    viewProject: "Ver demo",
    items: [
      {
        id: "norte-cafe",
        name: "Norte Café",
        category: "Hotelaria",
        description: "Uma torrefação de café de bairro com menu o dia todo.",
      },
      {
        id: "mar-aberto",
        name: "Mar Aberto",
        category: "Hotelaria",
        description: "Um restaurante de marisco construído à volta da pesca do dia.",
      },
      {
        id: "estudio-lima",
        name: "Estúdio Lima",
        category: "Criativo",
        description: "Um portefólio de estúdio de fotografia feito para vender sessões.",
      },
      {
        id: "vale-arquitetura",
        name: "Vale Arquitetura",
        category: "Serviços",
        description: "Um atelier de arquitetura a mostrar trabalho residencial e comercial.",
      },
      {
        id: "boutique-verde",
        name: "Boutique Verde",
        category: "Retalho",
        description: "Uma boutique de plantas e estilo de vida com catálogo online.",
      },
      {
        id: "consultoria-prime",
        name: "Consultoria Prime",
        category: "Serviços",
        description: "Uma consultora de negócios construída para gerar leads qualificados.",
      },
    ],
  },
  testimonials: {
    title: "O que dizem os clientes",
    items: [
      {
        quote:
          "Enviei três pedidos de edição no primeiro mês e nunca toquei numa linha de código.",
        name: "Marta",
        role: "dona de café",
      },
      {
        quote: "Ficámos no ar em menos de duas semanas e continua a ser atualizado todos os meses.",
        name: "Diego",
        role: "sócio de atelier de arquitetura",
      },
      {
        quote: "Mais barato que a nossa agência anterior, e realmente responsivo.",
        name: "Inês",
        role: "dona de boutique",
      },
    ],
  },
  faq: {
    title: "Perguntas frequentes",
    items: [
      {
        question: "O que está incluído num pedido de edição?",
        answer:
          "Alterações de texto, imagens e layout em páginas existentes. Dois pedidos estão incluídos grátis em cada período de faturação — pedidos extra são faturados individualmente.",
      },
      {
        question: "Posso mudar entre o plano Estático e o de E-commerce?",
        answer:
          "Sim, pode fazer upgrade ou downgrade no seu painel a qualquer momento; as alterações aplicam-se no próximo período de faturação.",
      },
      {
        question: "O domínio e o conteúdo são meus?",
        answer: "Sim. Regista e é dono do seu domínio, e todo o conteúdo e texto são seus.",
      },
      {
        question: "Quanto tempo demora o lançamento?",
        answer:
          "A maioria dos sites Estáticos é lançada uma a duas semanas após o início; sites de E-commerce demoram um pouco mais, dependendo do catálogo.",
      },
    ],
  },
  cta: {
    title: "Pronto para colocar o seu site no ar?",
    subtitle: "Comece uma subscrição hoje — sem chamada necessária, sem taxa de configuração.",
    button: "Começar",
  },
  footer: {
    tagline: "Websites à medida, desenhados, construídos e geridos por nós.",
    columns: [
      {
        title: "Produto",
        links: [
          { label: "Recursos", href: "#features" },
          { label: "Preços", href: "#pricing" },
          { label: "Projetos demo", href: "#projects" },
        ],
      },
      {
        title: "Conta",
        links: [
          { label: "Entrar", href: "/login" },
          { label: "Começar", href: "/signup" },
        ],
      },
    ],
    copyright: "© 2026 WebSouza. Todos os direitos reservados.",
  },
};
