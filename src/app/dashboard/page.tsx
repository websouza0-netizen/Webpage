import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PipelineStatus, type DeliveryStep } from "@/components/dashboard/pipeline-status";
import { getDashboardContext } from "@/lib/dashboard-data";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { CountUp } from "@/components/motion/count-up";

export default async function DashboardOverviewPage() {
  const supabase = await createClient();
  const { subscription, tokenBalance } = await getDashboardContext();

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
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Where your site stands right now.
        </p>
      </Reveal>

      <StaggerGroup className="grid gap-4 sm:grid-cols-3">
        <StaggerItem>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Plan</CardDescription>
              <CardTitle className="text-lg capitalize">
                {subscription ? subscription.plan : "No active plan"}
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
              <CardDescription>Site</CardDescription>
              <CardTitle className="text-lg">{site?.domain ?? "Not provisioned yet"}</CardTitle>
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
              <CardDescription>Edit requests remaining</CardDescription>
              <CardTitle className="text-lg">
                <CountUp value={tokenBalance} format={(n) => `${Math.round(n)} free`} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/requests" className="text-sm text-accent underline underline-offset-4">
                Submit a request
              </Link>
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerGroup>

      <Reveal delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle>Delivery pipeline</CardTitle>
            <CardDescription>Where your build is in the process.</CardDescription>
          </CardHeader>
          <CardContent>
            <PipelineStatus steps={(steps as DeliveryStep[] | null) ?? []} />
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
