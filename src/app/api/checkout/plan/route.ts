import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateStripeCustomer } from "@/lib/billing";
import { stripe, planPriceId, type Plan, type BillingInterval } from "@/lib/stripe";

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
  const plan = body?.plan as Plan | undefined;
  const interval = body?.interval as BillingInterval | undefined;

  if (plan !== "static" && plan !== "ecommerce") {
    return NextResponse.json({ error: "invalid plan" }, { status: 400 });
  }
  if (interval !== "monthly" && interval !== "annual") {
    return NextResponse.json({ error: "invalid interval" }, { status: 400 });
  }

  const customerId = await getOrCreateStripeCustomer(supabase, user.id, user.email ?? "");

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: planPriceId(plan, interval), quantity: 1 }],
    success_url: `${APP_URL}/dashboard/billing?checkout=success`,
    cancel_url: `${APP_URL}/dashboard/billing?checkout=canceled`,
    metadata: { client_id: user.id, kind: "plan_subscription", plan, interval },
    subscription_data: {
      metadata: { client_id: user.id, kind: "plan_subscription", plan, interval },
    },
  });

  return NextResponse.json({ url: session.url });
}
