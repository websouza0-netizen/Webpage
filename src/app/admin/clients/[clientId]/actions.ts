"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { requireAdmin } from "@/lib/require-admin";
import { sendDeliveryStepEmail } from "@/lib/email/notifications";

export async function markStepDone({
  clientId,
  stepKey,
  note,
  link,
}: {
  clientId: string;
  stepKey: string;
  note?: string;
  link?: string;
}) {
  await requireAdmin();

  const serviceRole = createServiceRoleClient();

  const { data: client, error: clientError } = await serviceRole
    .from("clients")
    .select("email, locale")
    .eq("id", clientId)
    .single();

  if (clientError || !client) {
    return { error: "Client not found." };
  }

  const { error: updateError } = await serviceRole
    .from("delivery_steps")
    .update({
      status: "done",
      completed_at: new Date().toISOString(),
      note: note?.trim() || null,
      link: link?.trim() || null,
    })
    .eq("client_id", clientId)
    .eq("step_key", stepKey);

  if (updateError) {
    return { error: updateError.message };
  }

  if (stepKey === "in_development") {
    await serviceRole
      .from("onboarding_briefs")
      .update({ locked_at: new Date().toISOString() })
      .eq("client_id", clientId);
  }

  await sendDeliveryStepEmail({
    to: client.email,
    clientId,
    locale: client.locale,
    stepKey,
    note,
  });

  revalidatePath(`/admin/clients/${clientId}`);
  return { ok: true as const };
}
