import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EarningsChart, type DailyRevenue } from "@/components/dashboard/earnings-chart";
import { getDashboardContext } from "@/lib/dashboard-data";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";
import { getServerLocale, dictionaryFor } from "@/lib/i18n/server";

export default async function EarningsPage() {
  const supabase = await createClient();
  const { user, subscription } = await getDashboardContext();
  const t = dictionaryFor(await getServerLocale()).dashboard.earnings;

  if (subscription?.plan !== "ecommerce") {
    redirect("/dashboard");
  }

  const { data: site } = await supabase
    .from("sites")
    .select("id, domain")
    .eq("client_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let sales: { order_id: string; amount_cents: number; created_at: string }[] = [];
  if (site) {
    const since = new Date();
    since.setDate(since.getDate() - 90);
    const { data } = await supabase
      .from("site_sales")
      .select("order_id, amount_cents, created_at")
      .eq("site_id", site.id)
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: true });
    sales = data ?? [];
  }

  const totalCents = sales.reduce((sum, s) => sum + s.amount_cents, 0);
  const orderCount = sales.length;
  const aovCents = orderCount > 0 ? Math.round(totalCents / orderCount) : 0;

  const byDay = new Map<string, number>();
  for (const s of sales) {
    const day = s.created_at.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + s.amount_cents);
  }
  const dailyRevenue: DailyRevenue[] = Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, amountCents]) => ({ day, amountCents }));

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="text-sm text-muted-foreground">
          {site ? `${t.revenueBy} ${site.domain}, ${t.last90Days}` : t.noSite}
        </p>
      </Reveal>

      <StaggerGroup className="grid gap-4 sm:grid-cols-3">
        <StaggerItem>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t.revenue}</CardDescription>
              <CardTitle className="text-2xl">
                <CountUp value={totalCents / 100} variant="eur" />
              </CardTitle>
            </CardHeader>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t.orders}</CardDescription>
              <CardTitle className="text-2xl">
                <CountUp value={orderCount} />
              </CardTitle>
            </CardHeader>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t.aov}</CardDescription>
              <CardTitle className="text-2xl">
                <CountUp value={aovCents / 100} variant="eur" />
              </CardTitle>
            </CardHeader>
          </Card>
        </StaggerItem>
      </StaggerGroup>

      <Reveal delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle>{t.revenueOverTime}</CardTitle>
          </CardHeader>
          <CardContent>
            <EarningsChart data={dailyRevenue} />
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
