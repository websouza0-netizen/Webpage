import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { ProvisionSiteForm } from "@/components/admin/provision-site-form";
import { Reveal } from "@/components/motion/reveal";
import { getServerLocale, dictionaryFor } from "@/lib/i18n/server";

export default async function AdminNewSitePage() {
  const serviceRole = createServiceRoleClient();
  const t = dictionaryFor(await getServerLocale()).admin.sitesNew;

  const [{ data: clients }, { data: sites }] = await Promise.all([
    serviceRole.from("clients").select("id, email, full_name").order("created_at", { ascending: false }),
    serviceRole.from("sites").select("client_id"),
  ]);

  const clientIdsWithSite = new Set((sites ?? []).map((s) => s.client_id));
  const clientsWithoutSite = (clients ?? []).filter((c) => !clientIdsWithSite.has(c.id));

  return (
    <div className="flex flex-col gap-6">
      <Reveal>
        <h1 className="text-2xl font-semibold">{t.title}</h1>
        <p className="text-sm text-muted-foreground">{t.subtitle}</p>
      </Reveal>
      <Reveal delay={0.05}>
        <ProvisionSiteForm clients={clientsWithoutSite} />
      </Reveal>
    </div>
  );
}
