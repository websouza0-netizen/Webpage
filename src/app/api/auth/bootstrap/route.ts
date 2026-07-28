import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureClientRecord } from "@/lib/client-bootstrap";
import { notifyAdmin, sendWelcomeEmail } from "@/lib/email";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const requestedLocale = body?.locale === "pt" ? "pt" : body?.locale === "en" ? "en" : undefined;

  const { isNewClient } = await ensureClientRecord(user, requestedLocale);

  if (isNewClient && user.email) {
    const name =
      (user.user_metadata?.full_name as string | undefined) ??
      (user.user_metadata?.name as string | undefined) ??
      null;
    const { data: clientRow } = await supabase
      .from("clients")
      .select("locale")
      .eq("id", user.id)
      .maybeSingle();
    const locale = clientRow?.locale === "pt" ? "pt" : "en";
    // Best-effort: a Gmail hiccup shouldn't fail account bootstrap.
    await Promise.allSettled([
      sendWelcomeEmail(user.email, name, locale),
      notifyAdmin("Novo registo na WebSouza", `Novo cliente: ${user.email}`),
    ]);
  }

  return NextResponse.json({ ok: true });
}
