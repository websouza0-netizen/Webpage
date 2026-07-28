"use server";

import { revalidatePath } from "next/cache";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { requireAdmin } from "@/lib/require-admin";
import { sendDeliveryStepEmail } from "@/lib/email/notifications";

function formatDate(date: string, locale: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(locale === "pt" ? "pt-BR" : "en-IE", {
    day: "numeric",
    month: "long",
  });
}

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

  // Reassure with concrete timing: if the step that's now next in line
  // already has a target date set, fold it into this email rather than
  // sending a second one — one notification per completed step.
  const { data: nextStep } = await serviceRole
    .from("delivery_steps")
    .select("title_en, title_pt, estimated_date")
    .eq("client_id", clientId)
    .eq("status", "pending")
    .order("step_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  let detail = note?.trim() || undefined;
  if (nextStep?.estimated_date) {
    const nextTitle = client.locale === "pt" ? nextStep.title_pt : nextStep.title_en;
    const dateText = formatDate(nextStep.estimated_date, client.locale);
    const reassurance =
      client.locale === "pt"
        ? `Próximo passo: ${nextTitle}, previsto para ${dateText}.`
        : `Next up: ${nextTitle}, expected around ${dateText}.`;
    detail = detail ? `${detail}\n\n${reassurance}` : reassurance;
  }

  await sendDeliveryStepEmail({
    to: client.email,
    clientId,
    locale: client.locale,
    stepKey,
    note: detail,
  });

  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/dashboard");
  return { ok: true as const };
}

export async function setStepEstimate({
  clientId,
  stepKey,
  estimatedDate,
}: {
  clientId: string;
  stepKey: string;
  estimatedDate: string | null;
}) {
  await requireAdmin();

  const serviceRole = createServiceRoleClient();
  const { error } = await serviceRole
    .from("delivery_steps")
    .update({ estimated_date: estimatedDate })
    .eq("client_id", clientId)
    .eq("step_key", stepKey);

  if (error) return { error: error.message };

  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/dashboard");
  return { ok: true as const };
}
