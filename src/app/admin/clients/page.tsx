import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { getServerLocale, dictionaryFor } from "@/lib/i18n/server";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  trialing: "secondary",
  past_due: "destructive",
  canceled: "outline",
  incomplete: "outline",
};

export default async function AdminClientsPage() {
  const serviceRole = createServiceRoleClient();
  const t = dictionaryFor(await getServerLocale()).admin.clients;

  const [{ data: clients }, { data: subscriptions }, { data: briefs }, { data: steps }] = await Promise.all([
    serviceRole.from("clients").select("id, email, full_name, created_at").order("created_at", { ascending: false }),
    serviceRole
      .from("subscriptions")
      .select("client_id, plan, status, created_at")
      .order("created_at", { ascending: false }),
    serviceRole.from("onboarding_briefs").select("client_id"),
    serviceRole
      .from("delivery_steps")
      .select("client_id, step_order, title_en, status")
      .order("step_order", { ascending: true }),
  ]);

  const latestSubByClient = new Map<string, { plan: string; status: string }>();
  for (const sub of subscriptions ?? []) {
    if (!latestSubByClient.has(sub.client_id)) {
      latestSubByClient.set(sub.client_id, { plan: sub.plan, status: sub.status });
    }
  }

  const briefClientIds = new Set((briefs ?? []).map((b) => b.client_id));

  const stepsByClient = new Map<string, { step_order: number; title_en: string; status: string }[]>();
  for (const step of steps ?? []) {
    const list = stepsByClient.get(step.client_id) ?? [];
    list.push(step);
    stepsByClient.set(step.client_id, list);
  }

  function currentStepLabel(clientId: string) {
    const clientSteps = stepsByClient.get(clientId);
    if (!clientSteps || clientSteps.length === 0) return t.noPipelineYet;
    const pending = clientSteps.find((s) => s.status === "pending");
    const current = pending ?? clientSteps[clientSteps.length - 1];
    return pending ? `${current.title_en} (${t.current})` : `${current.title_en} (${t.done})`;
  }

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="text-sm text-muted-foreground">
          {clients?.length ?? 0} {t.total}
        </p>
      </Reveal>
      <StaggerGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(clients ?? []).map((client) => {
          const sub = latestSubByClient.get(client.id);
          const hasBrief = briefClientIds.has(client.id);
          return (
            <StaggerItem key={client.id}>
              <Link href={`/admin/clients/${client.id}`}>
                <Card className="h-full transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:border-accent hover:shadow-md">
                  <CardHeader>
                    <CardTitle>{client.full_name || client.email}</CardTitle>
                    <CardDescription>{client.email}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {sub ? (
                        <>
                          <Badge variant="outline">{sub.plan}</Badge>
                          <Badge variant={STATUS_VARIANT[sub.status] ?? "outline"}>{sub.status}</Badge>
                        </>
                      ) : (
                        <Badge variant="outline">{t.noSubscription}</Badge>
                      )}
                      <Badge variant={hasBrief ? "secondary" : "outline"}>
                        {hasBrief ? t.briefSubmitted : t.noBriefYet}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{currentStepLabel(client.id)}</p>
                  </CardContent>
                </Card>
              </Link>
            </StaggerItem>
          );
        })}
      </StaggerGroup>
    </div>
  );
}
