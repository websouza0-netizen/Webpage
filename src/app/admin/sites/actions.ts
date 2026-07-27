"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { requireAdmin } from "@/lib/require-admin";

export async function provisionSite({
  clientId,
  domain,
  plan,
}: {
  clientId: string;
  domain: string;
  plan: "static" | "ecommerce";
}) {
  await requireAdmin();

  if (!clientId) return { error: "Pick a client." };
  if (!domain.trim()) return { error: "Domain is required." };

  const serviceRole = createServiceRoleClient();

  const { data: site, error } = await serviceRole
    .from("sites")
    .insert({ client_id: clientId, domain: domain.trim(), plan })
    .select("id, domain, plan, tracking_snippet_id, ingest_token")
    .single();

  if (error || !site) {
    return { error: error?.message ?? "Could not create site." };
  }

  revalidatePath("/admin/sites/new");
  return { ok: true as const, site };
}
