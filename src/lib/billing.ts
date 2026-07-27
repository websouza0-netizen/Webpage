import type { SupabaseClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";

/**
 * Looks up (or creates) the Stripe customer for the current user. Takes
 * the user's own RLS-scoped Supabase client — the `clients_update_own`
 * policy allows writing `stripe_customer_id` on your own row, so no
 * service-role client is needed here.
 */
export async function getOrCreateStripeCustomer(
  supabase: SupabaseClient,
  userId: string,
  email: string,
): Promise<string> {
  const { data: client } = await supabase
    .from("clients")
    .select("stripe_customer_id")
    .eq("id", userId)
    .single();

  if (client?.stripe_customer_id) return client.stripe_customer_id;

  const customer = await stripe.customers.create({
    email,
    metadata: { client_id: userId },
  });

  await supabase
    .from("clients")
    .update({ stripe_customer_id: customer.id })
    .eq("id", userId);

  return customer.id;
}
