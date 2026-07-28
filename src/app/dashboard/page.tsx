import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { SiteStatusHero, type DeliveryStep } from "@/components/dashboard/pipeline-status";
import { getDashboardContext } from "@/lib/dashboard-data";
import { Reveal } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";
import { getServerLocale, dictionaryFor } from "@/lib/i18n/server";

export default async function DashboardOverviewPage() {
  const supabase = await createClient();
  const { subscription, tokenBalance } = await getDashboardContext();
  const locale = await getServerLocale();
  const t = dictionaryFor(locale).dashboard.overview;

  const [{ data: steps }, { data: site }] = await Promise.all([
    supabase
      .from("delivery_steps")
      .select("id, step_key, step_order, title_en, title_pt, status, note, link, completed_at, estimated_date")
      .order("step_order", { ascending: true }),
    supabase
      .from("sites")
      .select("domain, status")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </Reveal>

      <Reveal delay={0.05}>
        <Card>
          <CardContent>
            <SiteStatusHero
              steps={(steps as DeliveryStep[] | null) ?? []}
              site={site}
              locale={locale}
              t={{
                notStartedTitle: t.notStartedTitle,
                notStartedSubtitle: t.notStartedSubtitle,
                startBrief: t.startBrief,
                inProgressSubtitle: t.inProgressSubtitle,
                liveSubtitle: t.liveSubtitle,
                visitSite: t.visitSite,
                expectedAround: t.expectedAround,
              }}
            />
          </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={0.1}>
        <Card>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-6">
              <div>
                <p className="text-xs text-muted-foreground">{t.plan}</p>
                <p className="font-medium capitalize">{subscription ? subscription.plan : t.noActivePlan}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.editRequestsRemaining}</p>
                <p className="font-medium">
                  <CountUp value={tokenBalance} suffix={` ${t.free}`} />
                </p>
              </div>
            </div>
            <Link href="/dashboard/requests" className="text-sm text-accent underline underline-offset-4">
              {t.submitRequest}
            </Link>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
