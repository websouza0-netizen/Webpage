import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { RequestStatusSelect } from "@/components/admin/request-status-select";
import { Reveal } from "@/components/motion/reveal";
import { getServerLocale, dictionaryFor } from "@/lib/i18n/server";

export default async function AdminRequestsPage() {
  const serviceRole = createServiceRoleClient();
  const t = dictionaryFor(await getServerLocale()).admin.requestsPage;

  const [{ data: requests }, { data: clients }] = await Promise.all([
    serviceRole
      .from("edit_requests")
      .select("id, client_id, description, status, created_at")
      .order("created_at", { ascending: false }),
    serviceRole.from("clients").select("id, email"),
  ]);

  const emailByClientId = new Map((clients ?? []).map((c) => [c.id, c.email]));

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="text-sm text-muted-foreground">
          {requests?.length ?? 0} {t.totalAcrossClients}
        </p>
      </Reveal>
      <Reveal delay={0.05}>
      <Card>
        <CardContent>
          {requests && requests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.client}</TableHead>
                  <TableHead>{t.description}</TableHead>
                  <TableHead>{t.submitted}</TableHead>
                  <TableHead>{t.status}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{emailByClientId.get(r.client_id) ?? r.client_id}</TableCell>
                    <TableCell className="whitespace-normal">{r.description}</TableCell>
                    <TableCell>{new Date(r.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <RequestStatusSelect requestId={r.id} status={r.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">{t.noRequests}</p>
          )}
        </CardContent>
      </Card>
      </Reveal>
    </div>
  );
}
