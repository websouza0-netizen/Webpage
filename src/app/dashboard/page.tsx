import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PipelineStatus, type DeliveryStep } from "@/components/dashboard/pipeline-status";
import { getDashboardContext } from "@/lib/dashboard-data";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";
import { getServerLocale, dictionaryFor } from "@/lib/i18n/server";

export default async function DashboardOverviewPage() {
  const supabase = await createClient();
  const { subscription, tokenBalance } = await getDashboardContext();
  const t = dictionaryFor(await getServerLocale()).dashboard.overview;

  const { data: steps } = await supabase
    .from("delivery_steps")
    .select("id, step_key, step_order, title_en, status, note, link, completed_at")
    .order("step_order", { ascending: true });

  const { data: site } = await supabase
    .from("sites")
    .select("domain, status")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </Reveal>

      <StaggerGroup className="grid gap-4 sm:grid-cols-3">
        <StaggerItem>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t.plan}</CardDescription>
              <CardTitle className="text-lg capitalize">
                {subscription ? subscription.plan : t.noActivePlan}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subscription && (
                <Badge variant={subscription.status === "active" ? "default" : "destructive"}>
                  {subscription.status}
                </Badge>
              )}
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t.site}</CardDescription>
              <CardTitle className="text-lg">{site?.domain ?? t.notProvisioned}</CardTitle>
            </CardHeader>
            <CardContent>
              {site && (
                <Badge variant={site.status === "active" ? "default" : "secondary"}>{site.status}</Badge>
              )}
            </CardContent>
          </Card>
        </StaggerItem>
        <StaggerItem>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t.editRequestsRemaining}</CardDescription>
              <CardTitle className="text-lg">
                <CountUp value={tokenBalance} suffix={` ${t.free}`} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/requests" className="text-sm text-accent underline underline-offset-4">
                {t.submitRequest}
              </Link>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerGroup>

      <Reveal delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle>{t.deliveryPipeline}</CardTitle>
            <CardDescription>{t.deliveryPipelineSubtitle}</CardDescription>
          </CardHeader>
          <CardContent>
            <PipelineStatus steps={(steps as DeliveryStep[] | null) ?? []} />
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
