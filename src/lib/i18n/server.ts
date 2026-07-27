import { createClient } from "@/lib/supabase/server";
import { en } from "./en";
import { pt } from "./pt";
import type { Locale } from "./index";

// Server-rendered areas (dashboard/admin/onboarding) resolve the dictionary
// directly from the authenticated user's `clients.locale`, rather than the
// client-only localStorage detection the marketing site uses — there's no
// hydration flash to avoid here since these pages are already gated behind
// auth and server-rendered per request.
export async function getServerLocale(): Promise<Locale> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "en";

  const { data } = await supabase.from("clients").select("locale").eq("id", user.id).maybeSingle();
  return data?.locale === "pt" ? "pt" : "en";
}

export function dictionaryFor(locale: Locale) {
  return locale === "pt" ? pt : en;
}
