"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { requireAdmin } from "@/lib/require-admin";

export async function markBriefReviewed(briefId: string) {
  await requireAdmin();

  const serviceRole = createServiceRoleClient();
  const { error } = await serviceRole
    .from("onboarding_briefs")
    .update({ reviewed_at: new Date().toISOString() })
    .eq("id", briefId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/briefs/${briefId}`);
  revalidatePath("/admin/briefs");
  return { ok: true as const };
}
