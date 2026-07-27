import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateStripeCustomer } from "@/lib/billing";
import { stripe, addonPriceId, type AddonType } from "@/lib/stripe";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const type = body?.type as AddonType | undefined;

  if (type !== "email_pro" && type !== "manutencao") {
    return NextResponse.json({ error: "invalid addon type" }, { status: 400 });
  }

  const customerId = await getOrCreateStripeCustomer(supabase, user.id, user.email ?? "");

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: addonPriceId(type), quantity: 1 }],
    success_url: `${APP_URL}/dashboard/billing?checkout=success`,
    cancel_url: `${APP_URL}/dashboard/billing?checkout=canceled`,
    metadata: { client_id: user.id, kind: "addon_subscription", type },
    subscription_data: {
      metadata: { client_id: user.id, kind: "addon_subscription", type },
    },
  });

  return NextResponse.json({ url: session.url });
}
