import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { Reveal } from "@/components/motion/reveal";
import { getServerLocale, dictionaryFor } from "@/lib/i18n/server";

const LIMIT = 200;

export default async function AdminEmailLogPage() {
  const serviceRole = createServiceRoleClient();
  const t = dictionaryFor(await getServerLocale()).admin.emailLog;

  const { data: logs, count } = await serviceRole
    .from("email_log")
    .select("id, recipient, template, locale, status, provider_message_id, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .limit(LIMIT);

  const truncated = !!count && count > LIMIT;

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="text-sm text-muted-foreground">
          {t.showing} {logs?.length ?? 0}
          {truncated ? ` ${t.mostRecent} — ${t.truncatedNote}` : ` ${t.mostRecent}`}.
        </p>
      </Reveal>
      <Card>
        <CardContent>
          {logs && logs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.recipient}</TableHead>
                  <TableHead>{t.template}</TableHead>
                  <TableHead>{t.locale}</TableHead>
                  <TableHead>{t.status}</TableHead>
                  <TableHead>{t.providerMessageId}</TableHead>
                  <TableHead>{t.sentAt}</TableHead>
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
            <p className="text-sm text-muted-foreground">{t.noEmails}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
