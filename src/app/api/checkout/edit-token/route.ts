import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateStripeCustomer } from "@/lib/billing";
import { stripe, editTokenPriceId } from "@/lib/stripe";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(request: Request) {
  const { allowed, retryAfterSeconds } = rateLimit(`checkout:${clientIp(request)}`, {
    limit: 10,
    windowMs: 60_000,
  });
  if (!allowed) return rateLimitResponse(retryAfterSeconds);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const description = (body?.description as string | undefined)?.trim();
  const siteId = body?.siteId as string | undefined;

  if (!description) {
    return NextResponse.json({ error: "description is required" }, { status: 400 });
  }

  const customerId = await getOrCreateStripeCustomer(supabase, user.id, user.email ?? "");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    line_items: [{ price: editTokenPriceId(), quantity: 1 }],
    success_url: `${APP_URL}/dashboard/requests?checkout=success`,
    cancel_url: `${APP_URL}/dashboard/requests?checkout=canceled`,
    metadata: {
      client_id: user.id,
      kind: "edit_token",
      description,
      site_id: siteId ?? "",
    },
  });

  return NextResponse.json({ url: session.url });
}
