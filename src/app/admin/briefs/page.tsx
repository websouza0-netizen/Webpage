import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export default async function AdminBriefsPage() {
  const serviceRole = createServiceRoleClient();

  const { data: briefs } = await serviceRole
    .from("onboarding_briefs")
    .select("id, brand_name, contact_email, reviewed_at, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Briefs</h1>
        <p className="text-sm text-muted-foreground">{briefs?.length ?? 0} submitted.</p>
      </div>
      <Card>
        <CardContent className="flex flex-col gap-3">
          {(briefs ?? []).map((brief) => (
            <Link
              key={brief.id}
              href={`/admin/briefs/${brief.id}`}
              className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0 hover:text-accent"
            >
              <div>
                <p className="text-sm font-medium">{brief.brand_name}</p>
                <p className="text-xs text-muted-foreground">
                  {brief.contact_email} · {new Date(brief.created_at).toLocaleDateString()}
                </p>
              </div>
              <Badge variant={brief.reviewed_at ? "outline" : "secondary"}>
                {brief.reviewed_at ? "Reviewed" : "New"}
              </Badge>
            </Link>
          ))}
          {(!briefs || briefs.length === 0) && (
            <p className="text-sm text-muted-foreground">No briefs submitted yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
