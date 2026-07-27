import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { PLANS, formatEUR } from "@/lib/pricing";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";

const ACTIVE_STATUSES = ["active", "trialing"];

export default async function AdminOverviewPage() {
  const serviceRole = createServiceRoleClient();

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
      label: "MRR",
      value: Math.round(mrr),
      format: (n: number) => formatEUR(n),
      note: "Plan subscriptions only — add-ons aren't included (real EUR prices live in Stripe, not here).",
    },
    {
      label: "Active subscriptions",
      value: activeSubscriptions.length,
      note: "Status active or trialing.",
    },
    {
      label: "Pending edit requests",
      value: pendingRequests ?? 0,
      note: "Status = new.",
    },
    {
      label: "Briefs awaiting review",
      value: briefsAwaitingReview ?? 0,
      note: "reviewed_at is null.",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground">A snapshot of the whole platform.</p>
      </Reveal>
      <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StaggerItem key={stat.label}>
            <Card>
              <CardHeader>
                <CardDescription>{stat.label}</CardDescription>
                <CardTitle className="text-3xl">
                  <CountUp value={stat.value} format={stat.format} />
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
