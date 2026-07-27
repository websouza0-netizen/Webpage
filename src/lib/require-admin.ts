import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { OWNER_EMAIL } from "@/lib/email/resend";

/**
 * Server-only gate for every /admin page/layout/API route. Redirects to
 * /dashboard unless the current user is the hardcoded owner email or has a
 * row in `admins`. Checked via the service-role client since `admins` RLS
 * only allows a row to see itself anyway — service-role keeps this one
 * query consistent with the rest of the admin data access pattern.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/dashboard");
  }

  if (user.email === OWNER_EMAIL) {
    return { user };
  }

  const serviceRole = createServiceRoleClient();
  const { data: adminRow } = await serviceRole
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRow) {
    redirect("/dashboard");
  }

  return { user };
}
