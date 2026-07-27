"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { stripe } from "@/lib/stripe";

export async function deleteAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "not authenticated" as const };

  const service = createServiceRoleClient();

  const { data: client } = await service
    .from("clients")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();

  if (client?.stripe_customer_id) {
    const subs = await stripe.subscriptions.list({ customer: client.stripe_customer_id, status: "active" });
    await Promise.all(subs.data.map((s) => stripe.subscriptions.cancel(s.id)));
  }

  // clients row and everything FK'd to it (subscriptions, addons,
  // edit_requests, sites, onboarding_briefs, ...) cascades on delete.
  const { error } = await service.auth.admin.deleteUser(user.id);
  if (error) return { error: error.message };

  return { ok: true as const };
}
