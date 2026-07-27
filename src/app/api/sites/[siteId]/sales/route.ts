import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * Called by the tracking snippet embedded in an e-commerce build's
 * checkout-completion step — an external, unauthenticated storefront, not
 * a logged-in WebSouza user. Authenticated instead via the site's own
 * `ingest_token` (generated once at site-provisioning time), passed as a
 * bearer token. Upserts on (site_id, order_id) so a retried POST from the
 * storefront never double-counts revenue.
 */
export async function POST(request: Request, { params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) {
    return NextResponse.json({ error: "missing bearer token" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const orderId = body?.order_id as string | undefined;
  const amountCents = body?.amount_cents as number | undefined;
  const currency = (body?.currency as string | undefined) ?? "eur";

  if (!orderId || typeof amountCents !== "number") {
    return NextResponse.json({ error: "order_id and amount_cents are required" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  const { data: site } = await supabase
    .from("sites")
    .select("id, ingest_token")
    .eq("id", siteId)
    .single();

  if (!site || site.ingest_token !== token) {
    return NextResponse.json({ error: "invalid site or token" }, { status: 401 });
  }

  const { error } = await supabase.from("site_sales").upsert(
    {
      site_id: siteId,
      order_id: orderId,
      amount_cents: Math.round(amountCents),
      currency: currency.toLowerCase(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "site_id,order_id" },
  );

  if (error) {
    console.error("Failed to record site sale", error);
    return NextResponse.json({ error: "failed to record sale" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
