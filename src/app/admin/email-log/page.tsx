import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const LIMIT = 200;

export default async function AdminEmailLogPage() {
  const serviceRole = createServiceRoleClient();

  const { data: logs, count } = await serviceRole
    .from("email_log")
    .select("id, recipient, template, locale, status, provider_message_id, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(LIMIT);

  const truncated = !!count && count > LIMIT;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Email log</h1>
        <p className="text-sm text-muted-foreground">
          Showing {logs?.length ?? 0}{truncated ? ` of ${count}` : ""} most recent
          {truncated && " — truncated to the latest 200"}.
        </p>
      </div>
      <Card>
        <CardContent>
          {logs && logs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Locale</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Provider message ID</TableHead>
                  <TableHead>Sent at</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{log.recipient}</TableCell>
                    <TableCell>{log.template}</TableCell>
                    <TableCell>{log.locale}</TableCell>
                    <TableCell>
                      <Badge variant={log.status === "failed" ? "destructive" : "outline"}>{log.status}</Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{log.provider_message_id ?? "—"}</TableCell>
                    <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">No emails logged yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
