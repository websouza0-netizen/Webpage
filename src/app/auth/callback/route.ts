import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { ensureClientRecord } from "@/lib/client-bootstrap";
import { notifyAdmin, sendWelcomeEmail } from "@/lib/email";
import { OWNER_EMAIL } from "@/lib/email/resend";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next");
  // login/page.tsx always sends `next=/dashboard` by default, so treat that
  // default value the same as "no explicit next" for the admin-redirect check below.
  const explicitNext = rawNext && rawNext !== "/dashboard" ? rawNext : null;

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

      let next = explicitNext ?? "/dashboard";

      // Route the owner (and any admins) straight into /admin on login,
      // mirroring the requireAdmin() gate, unless a specific `next` was requested.
      if (!explicitNext) {
        if (data.user.email === OWNER_EMAIL) {
          next = "/admin";
        } else {
          const serviceRole = createServiceRoleClient();
          const { data: adminRow } = await serviceRole
            .from("admins")
            .select("user_id")
            .eq("user_id", data.user.id)
            .maybeSingle();
          if (adminRow) next = "/admin";
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
