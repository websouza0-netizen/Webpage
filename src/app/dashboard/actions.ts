"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Locale } from "@/lib/i18n";

export async function setAccountLocale(locale: Locale) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "not authenticated" as const };

  const { error } = await supabase.from("clients").update({ locale }).eq("id", user.id);
  if (error) return { error: error.message };

  revalidatePath("/dashboard", "layout");
  return { ok: true as const };
}
