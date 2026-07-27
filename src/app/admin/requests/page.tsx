import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { RequestStatusSelect } from "@/components/admin/request-status-select";
import { Reveal } from "@/components/motion/reveal";

export default async function AdminRequestsPage() {
  const serviceRole = createServiceRoleClient();

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
        <h1 className="text-2xl font-semibold">Edit requests</h1>
        <p className="text-sm text-muted-foreground">{requests?.length ?? 0} total, across all clients.</p>
      </Reveal>
      <Reveal delay={0.05}>
      <Card>
        <CardContent>
          {requests && requests.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
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
            <p className="text-sm text-muted-foreground">No edit requests yet.</p>
          )}
        </CardContent>
      </Card>
      </Reveal>
    </div>
  );
}
