import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DEMO_PROJECTS, getDemoProject } from "@/lib/demo-projects";
import { DemoBanner } from "@/components/marketing/demo-banner";

export function generateStaticParams() {
  return DEMO_PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getDemoProject(slug);
  if (!project) return {};
  return {
    title: `${project.name} — WebSouza demo project`,
    description: project.hero.subtitle,
  };
}

export default async function DemoProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getDemoProject(slug);
  if (!project) notFound();

  const { colors } = project;

  return (
    <div style={{ backgroundColor: colors.background, color: colors.ink }} className="min-h-screen">
      <DemoBanner />

      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8">
        <p className="text-lg font-semibold tracking-tight">{project.name}</p>
        <span
          className="rounded-full px-3 py-1 text-xs font-medium"
          style={{ backgroundColor: colors.surface, color: colors.accent }}
        >
          {project.category}
        </span>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-16 text-center sm:py-24">
        <p
          className="text-sm font-medium uppercase tracking-wide"
          style={{ color: colors.accent }}
        >
          {project.hero.eyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-bold sm:text-6xl">{project.hero.heading}</h1>
        <p className="mx-auto mt-6 max-w-xl text-lg" style={{ color: colors.muted }}>
          {project.hero.subtitle}
        </p>
        <button
          type="button"
          className="mt-8 rounded-full px-6 py-3 text-sm font-semibold"
          style={{ backgroundColor: colors.accent, color: colors.background }}
        >
          {project.hero.cta}
        </button>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {project.highlights.map((h) => (
            <div
              key={h.title}
              className="rounded-2xl p-6"
              style={{ backgroundColor: colors.surface }}
            >
              <h3 className="text-lg font-semibold">{h.title}</h3>
              <p className="mt-2 text-sm" style={{ color: colors.muted }}>
                {h.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-16" style={{ backgroundColor: colors.surface }}>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-semibold sm:text-3xl">{project.about.title}</h2>
          <p className="mt-4" style={{ color: colors.muted }}>
            {project.about.body}
          </p>
        </div>
      </section>

      <footer className="px-6 py-10 text-center text-sm" style={{ color: colors.muted }}>
        {project.footer.note}
      </footer>
    </div>
  );
}
