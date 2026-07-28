import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { CollapsibleSection } from "@/components/dashboard/collapsible-section";
import { CheckoutButton } from "@/components/dashboard/checkout-button";
import { getDashboardContext } from "@/lib/dashboard-data";
import { PLANS, formatEUR, priceForInterval } from "@/lib/pricing";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { getServerLocale, dictionaryFor } from "@/lib/i18n/server";

const ADDONS = [
  { type: "email_pro" as const, name: "Professional email", description: "A branded inbox for your domain." },
  { type: "manutencao" as const, name: "Maintenance", description: "Ongoing maintenance and small tweaks." },
];

export default async function BillingPage() {
  const supabase = await createClient();
  const { user, subscription, tokenBalance, readOnly } = await getDashboardContext();
  const t = dictionaryFor(await getServerLocale()).dashboard.billing;

  const [{ data: addons }, { data: client }] = await Promise.all([
    supabase.from("addons").select("type, status").eq("client_id", user!.id),
    supabase.from("clients").select("stripe_customer_id").eq("id", user!.id).single(),
  ]);

  const ownedAddonTypes = new Set((addons ?? []).map((a) => a.type));

  let invoices: { id: string; date: string; amount: string; status: string }[] = [];
  if (client?.stripe_customer_id) {
    const list = await stripe.invoices.list({ customer: client.stripe_customer_id, limit: 10 });
    invoices = list.data.map((inv) => ({
      id: inv.id ?? inv.number ?? "—",
      date: new Date((inv.created ?? 0) * 1000).toLocaleDateString(),
      amount: new Intl.NumberFormat("en-IE", { style: "currency", currency: inv.currency.toUpperCase() }).format(
        (inv.amount_paid ?? inv.total) / 100,
      ),
      status: inv.status ?? "unknown",
    }));
  }

  const otherPlans = PLANS.filter((p) => p.id !== subscription?.plan);
  const otherAddons = ADDONS.filter((a) => !ownedAddonTypes.has(a.type));

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </Reveal>

      <Reveal>
        <Card>
          <CardHeader>
            <CardTitle>{t.currentPlan}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center justify-between gap-4">
            <div>
              {subscription ? (
                <>
                  <p className="font-medium capitalize">
                    {subscription.plan} · {subscription.billing_interval}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {subscription.current_period_end
                      ? `${t.renews} ${new Date(subscription.current_period_end).toLocaleDateString()}`
                      : ""}
                  </p>
                  <Badge className="mt-2" variant={subscription.status === "active" ? "default" : "destructive"}>
                    {subscription.status}
                  </Badge>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">{t.noActivePlanYet}</p>
              )}
              <p className="mt-2 text-sm text-muted-foreground">
                {tokenBalance} {t.freeEditsRemaining}
              </p>
            </div>
            {client?.stripe_customer_id && (
              <CheckoutButton endpoint="/api/billing/portal" body={{}} variant="outline">
                {t.manageBilling}
              </CheckoutButton>
            )}
          </CardContent>
        </Card>
      </Reveal>

      {addons && addons.length > 0 && (
        <Reveal delay={0.05}>
          <Card>
            <CardHeader>
              <CardTitle>{t.yourAddons}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {addons.map((addon) => (
                <div key={addon.type} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{addon.type.replace("_", " ")}</span>
                  <Badge variant={addon.status === "active" ? "default" : "destructive"}>{addon.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </Reveal>
      )}

      <CollapsibleSection title={t.browseOtherPlans} defaultOpen={!subscription}>
        <StaggerGroup className="grid gap-4 sm:grid-cols-2">
          {otherPlans.map((plan) => (
            <StaggerItem key={plan.id}>
              <Card>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.tagline}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <p className="text-2xl font-semibold">
                    {formatEUR(priceForInterval(plan, "monthly"))}
                    <span className="text-sm font-normal text-muted-foreground">/mo</span>
                  </p>
                  <CheckoutButton
                    endpoint="/api/checkout/plan"
                    body={{ plan: plan.id, interval: "monthly" }}
                    disabled={readOnly}
                  >
                    {t.switchTo} {plan.name}
                  </CheckoutButton>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </CollapsibleSection>

      <CollapsibleSection title={t.browseAddons} defaultOpen={(addons ?? []).length === 0}>
        <StaggerGroup className="grid gap-4 sm:grid-cols-2">
          {otherAddons.map((addon) => (
            <StaggerItem key={addon.type}>
              <Card>
                <CardHeader>
                  <CardTitle>{addon.name}</CardTitle>
                  <CardDescription>{addon.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <CheckoutButton endpoint="/api/checkout/addon" body={{ type: addon.type }} disabled={readOnly}>
                    {t.add} {addon.name}
                  </CheckoutButton>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </CollapsibleSection>

      <CollapsibleSection title={t.paymentHistory} defaultOpen={false}>
        {invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t.noInvoices}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t.date}</TableHead>
                <TableHead>{t.amount}</TableHead>
                <TableHead>{t.status}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>{inv.date}</TableCell>
                  <TableCell>{inv.amount}</TableCell>
                  <TableCell className="capitalize">{inv.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CollapsibleSection>
    </div>
  );
}
