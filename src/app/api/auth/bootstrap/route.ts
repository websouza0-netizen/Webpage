import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureClientRecord } from "@/lib/client-bootstrap";
import { notifyAdmin, sendWelcomeEmail } from "@/lib/email";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "not authenticated" }, { status: 401 });
  }

  const { isNewClient } = await ensureClientRecord(user);

  if (isNewClient && user.email) {
    const name =
      (user.user_metadata?.full_name as string | undefined) ??
      (user.user_metadata?.name as string | undefined) ??
      null;
    // Best-effort: a Gmail hiccup shouldn't fail account bootstrap.
    await Promise.allSettled([
      sendWelcomeEmail(user.email, name),
      notifyAdmin("Novo registo na WebSouza", `Novo cliente: ${user.email}`),
    ]);
  }

  return NextResponse.json({ ok: true });
}
