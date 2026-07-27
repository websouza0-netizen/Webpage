import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeSupabase, type FakeSupabase } from "@/test/fake-supabase";

let fake: FakeSupabase;

vi.mock("@/lib/supabase/service-role", () => ({
  createServiceRoleClient: () => fake,
}));

const { ensureClientRecord } = await import("./client-bootstrap");

describe("ensureClientRecord", () => {
  beforeEach(() => {
    fake = createFakeSupabase();
  });

  it("creates a clients row and seeds the free edit-token balance for a new user", async () => {
    await ensureClientRecord({
      id: "user-1",
      email: "new@example.com",
      user_metadata: { full_name: "New User" },
    });

    expect(fake.tables.clients).toEqual([{ id: "user-1", email: "new@example.com", full_name: "New User" }]);
    expect(fake.tables.edit_tokens).toEqual([{ client_id: "user-1", balance: 2 }]);
  });

  it("falls back to user_metadata.name when full_name is absent", async () => {
    await ensureClientRecord({ id: "user-2", email: "b@example.com", user_metadata: { name: "B Name" } });
    expect(fake.tables.clients[0].full_name).toBe("B Name");
  });

  it("never resets an existing token balance on repeat calls (ON CONFLICT DO NOTHING semantics)", async () => {
    fake = createFakeSupabase({
      clients: [{ id: "user-3", email: "c@example.com", full_name: "C" }],
      edit_tokens: [{ client_id: "user-3", balance: 0 }],
    });

    await ensureClientRecord({ id: "user-3", email: "c@example.com" });

    // ignoreDuplicates means a second bootstrap call must not top the balance back up to 2.
    expect(fake.tables.edit_tokens.find((r) => r.client_id === "user-3")?.balance).toBe(0);
  });
});
