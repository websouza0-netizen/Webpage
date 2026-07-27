import { createClient } from "@/lib/supabase/server";

export type DashboardSubscription = {
  id: string;
  plan: "static" | "ecommerce";
  billing_interval: "monthly" | "annual";
  status: "trialing" | "active" | "past_due" | "canceled" | "incomplete";
  current_period_end: string | null;
} | null;

/**
 * Single consolidated fetch for the data every dashboard page/layout
 * needs (subscription for the read-only banner + plan-gated nav items,
 * token balance for the billing/requests pages). Avoids each page
 * re-querying the same handful of small tables.
 */
export async function getDashboardContext() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, subscription: null, tokenBalance: 0, readOnly: false };
  }

  const [{ data: subscription }, { data: tokens }] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("id, plan, billing_interval, status, current_period_end")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("edit_tokens").select("balance").eq("client_id", user.id).maybeSingle(),
  ]);

  const readOnly = subscription?.status === "past_due" || subscription?.status === "canceled";

  return {
    user,
    subscription: (subscription as DashboardSubscription) ?? null,
    tokenBalance: tokens?.balance ?? 0,
    readOnly,
  };
}
