import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { getServerLocale, dictionaryFor } from "@/lib/i18n/server";

export default async function AdminBriefsPage() {
  const serviceRole = createServiceRoleClient();
  const t = dictionaryFor(await getServerLocale()).admin.briefs;

  const { data: briefs } = await serviceRole
    .from("onboarding_briefs")
    .select("id, brand_name, contact_email, reviewed_at, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="text-sm text-muted-foreground">
          {briefs?.length ?? 0} {t.submitted}
        </p>
      </Reveal>
      <Reveal delay={0.05}>
        <Card>
          <CardContent className="flex flex-col gap-3">
            <StaggerGroup className="flex flex-col gap-3">
              {(briefs ?? []).map((brief) => (
                <StaggerItem key={brief.id}>
                  <Link
                    href={`/admin/briefs/${brief.id}`}
                    className="flex items-center justify-between gap-4 border-b border-border pb-3 transition-colors last:border-0 last:pb-0 hover:text-accent"
                  >
                    <div>
                      <p className="text-sm font-medium">{brief.brand_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {brief.contact_email} · {new Date(brief.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={brief.reviewed_at ? "outline" : "secondary"}>
                      {brief.reviewed_at ? t.reviewed : t.new}
                    </Badge>
                  </Link>
                </StaggerItem>
              ))}
            </StaggerGroup>
            {(!briefs || briefs.length === 0) && (
              <p className="text-sm text-muted-foreground">{t.noBriefs}</p>
            )}
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
