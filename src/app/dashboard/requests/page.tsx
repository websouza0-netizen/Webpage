import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RequestForm } from "@/components/dashboard/request-form";
import { getDashboardContext } from "@/lib/dashboard-data";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { getServerLocale, dictionaryFor } from "@/lib/i18n/server";

const STATUS_VARIANT = {
  new: "secondary",
  in_progress: "default",
  done: "outline",
} as const;

export default async function RequestsPage() {
  const supabase = await createClient();
  const { user, tokenBalance, readOnly } = await getDashboardContext();
  const t = dictionaryFor(await getServerLocale()).dashboard.requests;

  const { data: requests } = await supabase
    .from("edit_requests")
    .select("id, description, status, created_at")
    .eq("client_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </Reveal>

      <Reveal>
        <Card>
          <CardHeader>
            <CardTitle>{t.requestChange}</CardTitle>
            <CardDescription>{t.freeIncluded}</CardDescription>
          </CardHeader>
          <CardContent>
            <RequestForm tokenBalance={tokenBalance} readOnly={readOnly} t={t} />
          </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={0.1}>
        <Card>
          <CardHeader>
            <CardTitle>{t.history}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {!requests || requests.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.noRequests}</p>
            ) : (
              <StaggerGroup className="flex flex-col gap-3">
                {requests.map((r) => (
                  <StaggerItem key={r.id}>
                    <div className="flex items-start justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
                      <div>
                        <p className="text-sm">{r.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(r.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={STATUS_VARIANT[r.status as keyof typeof STATUS_VARIANT]}>
                        {r.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerGroup>
            )}
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
