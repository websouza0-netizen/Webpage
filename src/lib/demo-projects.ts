// Six fictional demo projects used to showcase visual range on the
// marketing homepage. Each renders as a standalone single-page mock site
// at /demo/[slug] with its own distinct palette and copy — placeholder
// content, not real client work.

export type DemoCategory = "Hospitality" | "Creative" | "Services" | "Retail";

export type DemoProject = {
  slug: string;
  name: string;
  category: DemoCategory;
  colors: {
    background: string;
    surface: string;
    ink: string;
    muted: string;
    accent: string;
  };
  hero: {
    eyebrow: string;
    heading: string;
    subtitle: string;
    cta: string;
  };
  highlights: { title: string; description: string }[];
  about: { title: string; body: string };
  footer: { note: string };
};

export const DEMO_PROJECTS: DemoProject[] = [
  {
    slug: "norte-cafe",
    name: "Norte Café",
    category: "Hospitality",
    colors: {
      background: "#231710",
      surface: "#2f2015",
      ink: "#f5ead9",
      muted: "#c9b39c",
      accent: "#e0a63f",
    },
    hero: {
      eyebrow: "Specialty coffee, roasted weekly",
      heading: "Coffee worth slowing down for",
      subtitle:
        "Norte Café is a neighbourhood roastery serving single-origin coffee, fresh pastries, and a place to sit for a while.",
      cta: "See the menu",
    },
    highlights: [
      {
        title: "In-house roastery",
        description: "Beans roasted in small batches every week, sourced direct from three farms.",
      },
      {
        title: "All-day pastry case",
        description: "Laminated pastries baked fresh each morning by our in-house baker.",
      },
      {
        title: "A place to work",
        description: "Fast wifi, plenty of outlets, and a quiet room upstairs for calls.",
      },
    ],
    about: {
      title: "Our story",
      body: "Norte Café opened in 2019 with one espresso machine and a plan to do fewer things better. Six years later, we still roast in-house and still pull every shot to order.",
    },
    footer: { note: "Norte Café — open daily, 7am–6pm." },
  },
  {
    slug: "mar-aberto",
    name: "Mar Aberto",
    category: "Hospitality",
    colors: {
      background: "#07242c",
      surface: "#0d3440",
      ink: "#eef6f7",
      muted: "#9fc2c9",
      accent: "#4fb8a8",
    },
    hero: {
      eyebrow: "Fresh from the harbour every morning",
      heading: "Seafood, straight off the boat",
      subtitle:
        "Mar Aberto builds its menu around the daily catch — simple preparations that let the fish speak for itself.",
      cta: "View tonight's menu",
    },
    highlights: [
      {
        title: "Daily catch board",
        description: "A menu that changes with what the boats bring in that morning.",
      },
      {
        title: "Harbourside terrace",
        description: "Seating for 40 with an open view of the water at sunset.",
      },
      {
        title: "Local pairings",
        description: "A short, well-chosen wine list from growers within 100km.",
      },
    ],
    about: {
      title: "About us",
      body: "Started by two brothers who grew up on fishing boats, Mar Aberto has served the same stretch of coastline for over a decade, one changing menu at a time.",
    },
    footer: { note: "Mar Aberto — reservations recommended, Tue–Sun." },
  },
  {
    slug: "estudio-lima",
    name: "Estúdio Lima",
    category: "Creative",
    colors: {
      background: "#0a0a0a",
      surface: "#161616",
      ink: "#f5f5f5",
      muted: "#a3a3a3",
      accent: "#e85d75",
    },
    hero: {
      eyebrow: "Portrait and editorial photography",
      heading: "Photography that holds a moment",
      subtitle:
        "Estúdio Lima shoots portraits, weddings, and editorial work for people who want photos they'll still want to look at in twenty years.",
      cta: "Book a session",
    },
    highlights: [
      {
        title: "Full-day availability",
        description: "Weddings and events shot start to finish, no hourly clock-watching.",
      },
      {
        title: "48-hour previews",
        description: "A curated preview gallery within two days of every shoot.",
      },
      {
        title: "Print-ready delivery",
        description: "Final galleries color-graded and delivered print-ready, not just web-sized.",
      },
    ],
    about: {
      title: "The studio",
      body: "Founded by photographer Inês Lima after a decade shooting for magazines, the studio now works with a small number of clients each month by design.",
    },
    footer: { note: "Estúdio Lima — bookings by inquiry." },
  },
  {
    slug: "vale-arquitetura",
    name: "Vale Arquitetura",
    category: "Services",
    colors: {
      background: "#f2f0ec",
      surface: "#ffffff",
      ink: "#232320",
      muted: "#6b6b64",
      accent: "#5c6b47",
    },
    hero: {
      eyebrow: "Residential and commercial architecture",
      heading: "Buildings shaped by how they're used",
      subtitle:
        "Vale Arquitetura designs homes, offices, and public spaces that start from how people actually move through them.",
      cta: "Start a project",
    },
    highlights: [
      {
        title: "Full-service design",
        description: "From first sketch through construction documents and site visits.",
      },
      {
        title: "Sustainable materials",
        description: "A material palette chosen for longevity and local sourcing wherever possible.",
      },
      {
        title: "Licensed & insured",
        description: "A registered practice with 15 years handling permitting and code review.",
      },
    ],
    about: {
      title: "Our practice",
      body: "Vale Arquitetura is a nine-person studio working across residential, hospitality, and small commercial projects, led by principal architect Tomás Vale.",
    },
    footer: { note: "Vale Arquitetura — consultations by appointment." },
  },
  {
    slug: "boutique-verde",
    name: "Boutique Verde",
    category: "Retail",
    colors: {
      background: "#f6f3ea",
      surface: "#ffffff",
      ink: "#26301f",
      muted: "#6f7a63",
      accent: "#3f6b3f",
    },
    hero: {
      eyebrow: "Plants and slow-living goods",
      heading: "Bring a little green home",
      subtitle:
        "Boutique Verde curates houseplants, ceramics, and small-batch home goods for people who like their spaces a bit alive.",
      cta: "Shop the collection",
    },
    highlights: [
      {
        title: "Plant care included",
        description: "Every plant ships with a care card and 30-day care support.",
      },
      {
        title: "Local ceramicists",
        description: "Pots and planters sourced from six independent makers.",
      },
      {
        title: "Weekly new arrivals",
        description: "A small, rotating selection instead of a warehouse catalog.",
      },
    ],
    about: {
      title: "Why we started",
      body: "Boutique Verde began as a market stall in 2021 and grew into a small shop because people kept asking where the plants came from.",
    },
    footer: { note: "Boutique Verde — shop online or visit in person." },
  },
  {
    slug: "consultoria-prime",
    name: "Consultoria Prime",
    category: "Services",
    colors: {
      background: "#0e1a2b",
      surface: "#152741",
      ink: "#f2f5fa",
      muted: "#9fb0c8",
      accent: "#c9a15a",
    },
    hero: {
      eyebrow: "Strategy and operations consulting",
      heading: "Clarity for growing businesses",
      subtitle:
        "Consultoria Prime works with founders and operators to fix the systems that stop working once a business scales past ten people.",
      cta: "Request a consultation",
    },
    highlights: [
      {
        title: "Operational audits",
        description: "A structured review of process, tooling, and team structure in two weeks.",
      },
      {
        title: "Hands-on implementation",
        description: "We don't just hand over a deck — we help put the changes in place.",
      },
      {
        title: "Fixed-scope engagements",
        description: "Clear deliverables and timelines agreed before any work begins.",
      },
    ],
    about: {
      title: "About the firm",
      body: "Founded by two former operations leads, Consultoria Prime has advised over sixty small and mid-sized businesses on the systems behind sustainable growth.",
    },
    footer: { note: "Consultoria Prime — by consultation only." },
  },
];

export function getDemoProject(slug: string) {
  return DEMO_PROJECTS.find((project) => project.slug === slug);
}
