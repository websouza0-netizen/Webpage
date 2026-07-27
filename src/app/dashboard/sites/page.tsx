import { createClient } from "@/lib/supabase/server";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { VisitBars } from "@/components/dashboard/visit-bars";
import { getServerLocale, dictionaryFor } from "@/lib/i18n/server";

export default async function SitesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const t = dictionaryFor(await getServerLocale()).dashboard.sites;

  const { data: sites } = await supabase
    .from("sites")
    .select("id, domain, status, created_at")
    .eq("client_id", user!.id)
    .order("created_at", { ascending: false });

  const siteIds = (sites ?? []).map((s) => s.id);
  const since = new Date();
  since.setDate(since.getDate() - 14);

  const { data: dailyVisits } =
    siteIds.length > 0
      ? await supabase
          .from("site_visit_daily")
          .select("site_id, day, count")
          .in("site_id", siteIds)
          .gte("day", since.toISOString().slice(0, 10))
          .order("day", { ascending: true })
      : { data: [] };

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </Reveal>

      {!sites || sites.length === 0 ? (
        <Reveal>
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              {t.notProvisioned}
            </CardContent>
          </Card>
        </Reveal>
      ) : (
        <StaggerGroup className="flex flex-col gap-6">
          {sites.map((site) => {
            const visits = (dailyVisits ?? []).filter((v) => v.site_id === site.id);
            const max = Math.max(1, ...visits.map((v) => v.count));

            return (
              <StaggerItem key={site.id}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>{site.domain}</CardTitle>
                      <CardDescription>
                        {t.added} {new Date(site.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant={site.status === "active" ? "default" : "secondary"}>{site.status}</Badge>
                  </CardHeader>
                  <CardContent>
                    {visits.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t.noVisitData}</p>
                    ) : (
                      <VisitBars visits={visits} max={max} />
                    )}
                  </CardContent>
                </Card>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      )}
    </div>
  );
}
