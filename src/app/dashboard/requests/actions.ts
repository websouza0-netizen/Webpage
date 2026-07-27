"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function submitFreeEditRequest(description: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "not authenticated" as const };
  if (!description.trim()) return { error: "Description is required." as const };

  const { data: newBalance, error: tokenError } = await supabase.rpc("consume_edit_token", {
    p_client_id: user.id,
  });

  if (tokenError) return { error: tokenError.message };
  if (newBalance === null) {
    return { error: "no_tokens" as const };
  }

  const { error: insertError } = await supabase.from("edit_requests").insert({
    client_id: user.id,
    description: description.trim(),
    consumed_token: true,
  });

  if (insertError) return { error: insertError.message };

  revalidatePath("/dashboard/requests");
  return { ok: true as const };
}
