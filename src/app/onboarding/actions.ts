"use server";

import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { briefSchema, MAX_UPLOAD_BYTES, MAX_TOTAL_FILES, ACCEPTED_IMAGE_TYPES } from "@/lib/onboarding-schema";
import { sendBriefReceivedEmail, sendOwnerNotificationEmail } from "@/lib/email/notifications";

export async function submitBrief(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "not authenticated" as const };

  const raw = formData.get("data");
  if (typeof raw !== "string") return { error: "invalid submission" as const };

  const parsed = briefSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "invalid submission" };
  const values = parsed.data;

  const { data: clientRow } = await supabase.from("clients").select("locale").eq("id", user.id).single();
  const locale = ((clientRow?.locale as "en" | "pt" | undefined) ?? "en") as "en" | "pt";

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: brief, error: briefError } = await supabase
    .from("onboarding_briefs")
    .upsert(
      {
        client_id: user.id,
        brand_name: values.brandName,
        one_liner: values.oneLiner,
        long_description: values.longDescription || null,
        theme_preference: values.themePreference || null,
        theme_notes: values.themeNotes || null,
        brand_colors: values.brandColors?.filter(Boolean) ?? [],
        reference_urls: values.referenceUrls?.filter(Boolean) ?? [],
        pages_needed: values.pagesNeeded,
        domain_choice: values.domainChoice || null,
        domain_value: values.domainValue || null,
        social_links: {
          instagram: values.socialInstagram || null,
          facebook: values.socialFacebook || null,
          tiktok: values.socialTiktok || null,
          existing_site: values.socialExistingSite || null,
        },
        contact_name: values.contactName || null,
        contact_phone: values.contactPhone || null,
        contact_email: values.contactEmail,
        ecommerce_product_count: values.ecommerceProductCount ?? null,
        ecommerce_payment_methods: values.ecommercePaymentMethods ?? null,
        ecommerce_shipping_needed: values.ecommerceShippingNeeded ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "client_id" },
    )
    .select("id")
    .single();

  if (briefError || !brief) return { error: briefError?.message ?? "Failed to save brief." };

  // Uploads are best-effort: if the `client-assets` bucket hasn't been
  // created yet (a manual Supabase Dashboard step), the brief itself is
  // still saved — only the asset row is skipped.
  const uploads = [
    ...formData.getAll("logo").map((f) => ({ file: f as File, kind: "logo" as const })),
    ...formData.getAll("photos").map((f) => ({ file: f as File, kind: "photo" as const })),
  ]
    .filter((f) => f.file instanceof File && f.file.size > 0)
    .slice(0, MAX_TOTAL_FILES + 1);

  for (const { file, kind } of uploads) {
    if (file.size > MAX_UPLOAD_BYTES || !ACCEPTED_IMAGE_TYPES.includes(file.type)) continue;
    const path = `${user.id}/${randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("client-assets").upload(path, file);
    if (uploadError) continue;
    await supabase.from("brief_assets").insert({
      brief_id: brief.id,
      client_id: user.id,
      storage_path: path,
      kind,
      file_name: file.name,
      size_bytes: file.size,
    });
  }

  // delivery_step_templates/delivery_steps are admin-only under RLS (no
  // policies for `authenticated`), so seeding the pipeline as a side
  // effect of the client's own submission has to go through the
  // service-role client rather than the user's own RLS-scoped one.
  const service = createServiceRoleClient();
  const plan = subscription?.plan ?? "static";
  const { data: templates } = await service
    .from("delivery_step_templates")
    .select("step_key, step_order, title_en, title_pt")
    .eq("plan", plan)
    .order("step_order");

  if (templates && templates.length > 0) {
    const rows = templates.map((t) => ({
      client_id: user.id,
      step_key: t.step_key,
      step_order: t.step_order,
      title_en: t.title_en,
      title_pt: t.title_pt,
      status: t.step_key === "brief_received" ? "done" : "pending",
      completed_at: t.step_key === "brief_received" ? new Date().toISOString() : null,
    }));
    await service.from("delivery_steps").upsert(rows, { onConflict: "client_id,step_key" });
  }

  await sendBriefReceivedEmail({ to: values.contactEmail, clientId: user.id, locale });
  await sendOwnerNotificationEmail({
    detail: `New brief submitted by ${values.brandName} (${values.contactEmail})`,
  });

  redirect("/dashboard");
}
