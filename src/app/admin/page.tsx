import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { PLANS } from "@/lib/pricing";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";
import { getServerLocale, dictionaryFor } from "@/lib/i18n/server";

const ACTIVE_STATUSES = ["active", "trialing"];

export default async function AdminOverviewPage() {
  const serviceRole = createServiceRoleClient();
  const t = dictionaryFor(await getServerLocale()).admin.overview;

  const [{ data: subscriptions }, { count: pendingRequests }, { count: briefsAwaitingReview }] =
    await Promise.all([
      serviceRole.from("subscriptions").select("plan, billing_interval, status"),
      serviceRole.from("edit_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
      serviceRole
        .from("onboarding_briefs")
        .select("id", { count: "exact", head: true })
        .is("reviewed_at", null),
    ]);

  const activeSubscriptions = (subscriptions ?? []).filter((s) => ACTIVE_STATUSES.includes(s.status));

  const mrr = activeSubscriptions.reduce((sum, sub) => {
    const plan = PLANS.find((p) => p.id === sub.plan);
    if (!plan) return sum;
    const monthlyEquivalent = sub.billing_interval === "annual" ? plan.annualPrice / 12 : plan.monthlyPrice;
    return sum + monthlyEquivalent;
  }, 0);

  const stats = [
    {
      label: t.mrr,
      value: Math.round(mrr),
      variant: "eur" as const,
      note: t.mrrNote,
    },
    {
      label: t.activeSubs,
      value: activeSubscriptions.length,
      note: t.activeSubsNote,
    },
    {
      label: t.pendingRequests,
      value: pendingRequests ?? 0,
      note: t.pendingRequestsNote,
    },
    {
      label: t.briefsAwaiting,
      value: briefsAwaitingReview ?? 0,
      note: t.briefsAwaitingNote,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </Reveal>
      <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StaggerItem key={stat.label}>
            <Card>
              <CardHeader>
                <CardDescription>{stat.label}</CardDescription>
                <CardTitle className="text-3xl">
                  <CountUp value={stat.value} variant={stat.variant} />
                </CardTitle>
                <p className="text-xs text-muted-foreground">{stat.note}</p>
              </CardHeader>
            </Card>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </div>
  );
}
