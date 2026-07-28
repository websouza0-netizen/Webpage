"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { provisionSite } from "@/app/admin/sites/actions";

type Client = { id: string; email: string; full_name: string | null };

type ProvisionedSite = {
  id: string;
  domain: string;
  plan: string;
  tracking_snippet_id: string;
  ingest_token: string;
};

function trackingSnippetFor(site: ProvisionedSite, origin: string) {
  return `<script>
(function () {
  fetch("${origin}/api/sites/${site.id}/visits", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: "Bearer ${site.ingest_token}" },
    body: JSON.stringify({ path: location.pathname, referrer: document.referrer || null }),
    keepalive: true,
  }).catch(function () {});
})();
</script>`;
}

export function ProvisionSiteForm({ clients }: { clients: Client[] }) {
  const [clientId, setClientId] = useState("");
  const [domain, setDomain] = useState("");
  const [plan, setPlan] = useState<"static" | "ecommerce">("static");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ProvisionedSite | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await provisionSite({ clientId, domain, plan });
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      setResult(res.site);
      setDomain("");
      setClientId("");
      toast.success("Site provisioned.");
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Provision a site</CardTitle>
          <CardDescription>Creates the site row with a fresh tracking snippet ID and ingest token.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="client">Client</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger id="client">
                  <SelectValue placeholder="Select a client without a site" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.full_name ? `${c.full_name} — ${c.email}` : c.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {clients.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Every client already has a site provisioned.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="plan">Plan</Label>
              <Select value={plan} onValueChange={(v) => setPlan(v as "static" | "ecommerce")}>
                <SelectTrigger id="plan">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="static">Static site</SelectItem>
                  <SelectItem value="ecommerce">E-commerce site</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isPending || !clientId} className="w-fit">
              {isPending ? "Provisioning…" : "Provision site"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-accent">
          <CardHeader>
            <CardTitle>Site created — copy these now</CardTitle>
            <CardDescription>
              These identifiers aren&apos;t shown again here. Hand the ingest token to the client&apos;s
              storefront platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Domain</p>
              <p>
                {result.domain} ({result.plan})
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Tracking snippet ID</p>
              <p className="break-all font-mono text-xs">{result.tracking_snippet_id}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Ingest token</p>
              <p className="break-all font-mono text-xs">{result.ingest_token}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Tracking snippet — paste before {"</body>"}
              </p>
              <pre className="mt-1 overflow-x-auto whitespace-pre-wrap break-all rounded-md bg-muted p-3 font-mono text-xs">
                {trackingSnippetFor(result, typeof window !== "undefined" ? window.location.origin : "")}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
