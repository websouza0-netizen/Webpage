import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { rateLimit, rateLimitResponse } from "@/lib/rate-limit";

/**
 * Called by the tracking snippet embedded directly in a client's built
 * site — an external, unauthenticated storefront/page running in the
 * visitor's browser, not a logged-in WebSouza user. Authenticated via the
 * site's own `ingest_token` (generated once at site-provisioning time),
 * passed as a bearer token, same convention as the sales-ingest route.
 * Runs cross-origin from the browser, so CORS headers are required.
 */
const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "authorization, content-type",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function deviceTypeOf(userAgent: string | null): string | null {
  if (!userAgent) return null;
  if (/tablet|ipad/i.test(userAgent)) return "tablet";
  if (/mobile|android|iphone/i.test(userAgent)) return "mobile";
  return "desktop";
}

export async function POST(request: Request, { params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;

  // Unlike the sales-ingest route (rare checkout events), this fires on
  // every real pageview across a site's entire visitor base — a limit
  // sized for abuse protection on a low-frequency event would silently
  // drop legitimate traffic for any site with real visitors.
  const { allowed, retryAfterSeconds } = rateLimit(`visits:${siteId}`, { limit: 600, windowMs: 60_000 });
  if (!allowed) return rateLimitResponse(retryAfterSeconds);

  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;

  if (!token) {
    return NextResponse.json({ error: "missing bearer token" }, { status: 401, headers: CORS_HEADERS });
  }

  const body = await request.json().catch(() => null);
  const path = (body?.path as string | undefined) ?? "/";
  const referrer = (body?.referrer as string | undefined) ?? null;

  const supabase = createServiceRoleClient();

  const { data: site } = await supabase
    .from("sites")
    .select("id, ingest_token")
    .eq("id", siteId)
    .single();

  if (!site || site.ingest_token !== token) {
    return NextResponse.json({ error: "invalid site or token" }, { status: 401, headers: CORS_HEADERS });
  }

  const deviceType = deviceTypeOf(request.headers.get("user-agent"));
  const today = new Date().toISOString().slice(0, 10);

  const [{ error: visitError }, { error: dailyError }] = await Promise.all([
    supabase.from("site_visits").insert({ site_id: siteId, path, referrer, device_type: deviceType }),
    supabase.rpc("increment_site_visit_daily", { p_site_id: siteId, p_day: today }),
  ]);

  if (visitError || dailyError) {
    console.error("Failed to record site visit", visitError ?? dailyError);
    return NextResponse.json({ error: "failed to record visit" }, { status: 500, headers: CORS_HEADERS });
  }

  return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
}
