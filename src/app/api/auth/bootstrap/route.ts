import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureClientRecord } from "@/lib/client-bootstrap";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "not authenticated" }, { status: 401 });
  }

  await ensureClientRecord(user);
  return NextResponse.json({ ok: true });
}
