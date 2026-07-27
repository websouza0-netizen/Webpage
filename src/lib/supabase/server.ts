import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Per-request, cookie-bound, anon-key client — respects RLS. Use in Server
 * Components and Route Handlers reading/writing as the logged-in user.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component with no response to write to
            // (session refresh already happens in proxy.ts) — safe to ignore.
          }
        },
      },
    },
  );
}
