"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { requireAdmin } from "@/lib/require-admin";
import { sendEditRequestStatusEmail } from "@/lib/email/notifications";

export async function updateRequestStatus(requestId: string, status: "new" | "in_progress" | "done") {
  await requireAdmin();

  const serviceRole = createServiceRoleClient();

  const { data: request, error: fetchError } = await serviceRole
    .from("edit_requests")
    .select("client_id")
    .eq("id", requestId)
    .single();

  if (fetchError || !request) {
    return { error: "Request not found." };
  }

  const { error: updateError } = await serviceRole
    .from("edit_requests")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", requestId);

  if (updateError) {
    return { error: updateError.message };
  }

  const { data: client } = await serviceRole
    .from("clients")
    .select("email, locale")
    .eq("id", request.client_id)
    .single();

  if (client) {
    await sendEditRequestStatusEmail({
      to: client.email,
      clientId: request.client_id,
      locale: client.locale,
      status,
    });
  }

  revalidatePath("/admin/requests");
  return { ok: true as const };
}
