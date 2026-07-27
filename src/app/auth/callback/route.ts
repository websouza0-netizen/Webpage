import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureClientRecord } from "@/lib/client-bootstrap";
import { notifyAdmin, sendWelcomeEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Self-heals any account (fresh Google sign-in, or a legacy user)
      // missing a `clients` row on this login.
      const { isNewClient } = await ensureClientRecord(data.user);

      if (isNewClient && data.user.email) {
        const name =
          (data.user.user_metadata?.full_name as string | undefined) ??
          (data.user.user_metadata?.name as string | undefined) ??
          null;
        // Best-effort: a Gmail hiccup shouldn't block the OAuth redirect.
        await Promise.allSettled([
          sendWelcomeEmail(data.user.email, name),
          notifyAdmin("Novo registo na WebSouza", `Novo cliente: ${data.user.email}`),
        ]);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
