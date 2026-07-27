import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EarningsChart, type DailyRevenue } from "@/components/dashboard/earnings-chart";
import { getDashboardContext } from "@/lib/dashboard-data";
import { formatEUR } from "@/lib/pricing";

export default async function EarningsPage() {
  const supabase = await createClient();
  const { user, subscription } = await getDashboardContext();

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
      <div>
        <h1 className="text-2xl font-semibold">Earnings</h1>
        <p className="text-sm text-muted-foreground">
          {site ? `Revenue reported by ${site.domain}, last 90 days.` : "No site provisioned yet."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Revenue</CardDescription>
            <CardTitle className="text-2xl">{formatEUR(totalCents / 100)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Orders</CardDescription>
            <CardTitle className="text-2xl">{orderCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average order value</CardDescription>
            <CardTitle className="text-2xl">{formatEUR(aovCents / 100)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue over time</CardTitle>
        </CardHeader>
        <CardContent>
          <EarningsChart data={dailyRevenue} />
        </CardContent>
      </Card>
    </div>
  );
}
