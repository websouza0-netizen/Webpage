import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export type DeliveryStep = {
  id: string;
  step_key: string;
  step_order: number;
  title_en: string;
  title_pt: string;
  status: "pending" | "done";
  note: string | null;
  link: string | null;
  completed_at: string | null;
  estimated_date: string | null;
};

export type SiteStatusDict = {
  notStartedTitle: string;
  notStartedSubtitle: string;
  startBrief: string;
  inProgressSubtitle: string;
  liveSubtitle: string;
  visitSite: string;
  expectedAround: string;
};

function siteHref(domain: string) {
  return domain.startsWith("http") ? domain : `https://${domain}`;
}

/**
 * The one thing a non-technical client actually wants to know: is my site
 * ready, and if not, roughly when. No step lists, no jargon — a single
 * title that's plain text while in progress and turns into the live link
 * the moment the "launched" step is marked done (the deliberate admin
 * signal, not just a `sites` row existing — admins can provision that row
 * ahead of the build finishing).
 */
export function SiteStatusHero({
  steps,
  site,
  locale,
  t,
}: {
  steps: DeliveryStep[];
  site: { domain: string } | null;
  locale: "en" | "pt";
  t: SiteStatusDict;
}) {
  const title = (step: DeliveryStep) => (locale === "pt" ? step.title_pt : step.title_en);
  const dateFormat = (date: string) =>
    new Date(`${date}T00:00:00`).toLocaleDateString(locale === "pt" ? "pt-BR" : "en-IE", {
      day: "numeric",
      month: "long",
    });

  if (steps.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <p className="text-2xl font-semibold">{t.notStartedTitle}</p>
        <p className="text-sm text-muted-foreground">{t.notStartedSubtitle}</p>
        <Link
          href="/dashboard/brief"
          className="mt-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          {t.startBrief}
        </Link>
      </div>
    );
  }

  const launched = steps.find((s) => s.step_key === "launched");
  const isLive = launched?.status === "done" && !!site;

  if (isLive && site) {
    return (
      <div className="flex flex-col items-center gap-2 py-6 text-center">
        <a
          href={siteHref(site.domain)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${t.visitSite}: ${site.domain}`}
          className="inline-flex items-center gap-1.5 text-2xl font-semibold text-accent underline decoration-2 underline-offset-4"
        >
          {site.domain}
          <ArrowUpRight className="size-5" />
        </a>
        <p className="text-sm text-muted-foreground">{t.liveSubtitle}</p>
      </div>
    );
  }

  const currentIndex = steps.findIndex((s) => s.status === "pending");
  const current = currentIndex === -1 ? steps[steps.length - 1] : steps[currentIndex];
  const doneCount = steps.filter((s) => s.status === "done").length;

  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <p className="text-2xl font-semibold">{title(current)}</p>
      <p className="text-sm text-muted-foreground">{t.inProgressSubtitle}</p>
      {current.estimated_date && (
        <p className="text-sm text-accent">
          {t.expectedAround} {dateFormat(current.estimated_date)}
        </p>
      )}
      <div className="mt-2 flex w-full max-w-xs gap-1.5">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`h-1.5 flex-1 rounded-full ${step.status === "done" ? "bg-accent" : "bg-muted"}`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {doneCount}/{steps.length}
      </p>
    </div>
  );
}
