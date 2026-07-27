import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { PipelineEditor } from "@/components/admin/pipeline-editor";
import type { DeliveryStep } from "@/components/dashboard/pipeline-status";
import { Reveal } from "@/components/motion/reveal";
import { getServerLocale, dictionaryFor } from "@/lib/i18n/server";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  trialing: "secondary",
  past_due: "destructive",
  canceled: "outline",
  incomplete: "outline",
  new: "secondary",
  in_progress: "default",
  done: "outline",
};

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const serviceRole = createServiceRoleClient();
  const t = dictionaryFor(await getServerLocale()).admin.clientDetail;

  const [
    { data: client },
    { data: subscription },
    { data: addons },
    { data: tokens },
    { data: brief },
    { data: editRequests },
    { data: steps },
  ] = await Promise.all([
    serviceRole.from("clients").select("id, email, full_name, locale, created_at").eq("id", clientId).maybeSingle(),
    serviceRole
      .from("subscriptions")
      .select("id, plan, billing_interval, status, current_period_end")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    serviceRole.from("addons").select("id, type, status").eq("client_id", clientId),
    serviceRole.from("edit_tokens").select("balance").eq("client_id", clientId).maybeSingle(),
    serviceRole.from("onboarding_briefs").select("id, brand_name, reviewed_at").eq("client_id", clientId).maybeSingle(),
    serviceRole
      .from("edit_requests")
      .select("id, description, status, created_at")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false }),
    serviceRole
      .from("delivery_steps")
      .select("id, step_key, step_order, title_en, status, note, link, completed_at")
      .eq("client_id", clientId)
      .order("step_order", { ascending: true }),
  ]);

  if (!client) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <h1 className="text-2xl font-semibold">{client.full_name || client.email}</h1>
        <p className="text-sm text-muted-foreground">{client.email}</p>
      </Reveal>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.subscription}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {subscription ? (
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{subscription.plan}</Badge>
                <Badge variant="outline">{subscription.billing_interval}</Badge>
                <Badge variant={STATUS_VARIANT[subscription.status] ?? "outline"}>{subscription.status}</Badge>
                {subscription.current_period_end && (
                  <span className="text-xs text-muted-foreground">
                    {t.renews} {new Date(subscription.current_period_end).toLocaleDateString()}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t.noSubscriptionText}</p>
            )}
            <Separator />
            <div>
              <p className="text-sm font-medium">{t.addons}</p>
              {addons && addons.length > 0 ? (
                <div className="mt-1 flex flex-wrap gap-2">
                  {addons.map((a) => (
                    <Badge key={a.id} variant="outline">
                      {a.type} · {a.status}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t.none}</p>
              )}
            </div>
            <Separator />
            <p className="text-sm">
              {t.editTokenBalance} <span className="font-medium">{tokens?.balance ?? 0}</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.brief}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {brief ? (
              <>
                <p className="text-sm">{brief.brand_name}</p>
                <Badge variant={brief.reviewed_at ? "outline" : "secondary"} className="w-fit">
                  {brief.reviewed_at ? t.reviewed : t.awaitingReview}
                </Badge>
                <Button asChild variant="outline" size="sm" className="w-fit">
                  <Link href={`/admin/briefs/${brief.id}`}>{t.viewBrief}</Link>
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{t.noBrief}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.deliveryPipeline}</CardTitle>
          <CardDescription>{t.deliveryPipelineNote}</CardDescription>
        </CardHeader>
        <CardContent>
          {steps && steps.length > 0 ? (
            <PipelineEditor clientId={clientId} steps={steps as DeliveryStep[]} />
          ) : (
            <p className="text-sm text-muted-foreground">{t.noPipelineSteps}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t.editRequests}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {editRequests && editRequests.length > 0 ? (
            editRequests.map((r) => (
              <div
                key={r.id}
                className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <p className="text-sm">{r.description}</p>
                  <p className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
                <Badge variant={STATUS_VARIANT[r.status] ?? "outline"}>{r.status.replace("_", " ")}</Badge>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">{t.noEditRequests}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
