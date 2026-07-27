import { createServiceRoleClient } from "@/lib/supabase/service-role";

const FREE_EDIT_TOKENS = 2;

/**
 * Upserts a `clients` row for a just-authenticated user and seeds their
 * free edit-token balance. Uses the service-role client because RLS on
 * `clients` has no insert policy for `authenticated` — the row has to
 * exist before a client can act on any of their own data, so this can't
 * bootstrap itself through RLS. Safe to call repeatedly: `ON CONFLICT DO
 * NOTHING` means an existing token balance is never reset.
 */
export async function ensureClientRecord(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
}) {
  const supabase = createServiceRoleClient();
  const fullName =
    (user.user_metadata?.full_name as string | undefined) ??
    (user.user_metadata?.name as string | undefined) ??
    null;

  await supabase
    .from("clients")
    .upsert(
      { id: user.id, email: user.email ?? "", full_name: fullName },
      { onConflict: "id", ignoreDuplicates: true },
    );

  await supabase
    .from("edit_tokens")
    .upsert(
      { client_id: user.id, balance: FREE_EDIT_TOKENS },
      { onConflict: "client_id", ignoreDuplicates: true },
    );
}
