import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakeSupabase, type FakeSupabase } from "@/test/fake-supabase";

let fake: FakeSupabase;
let nextEvent: unknown;
let retrievedSubscription: unknown;
let signatureHeader: string | null = "test-signature";

vi.mock("next/headers", () => ({
  headers: async () => ({ get: () => signatureHeader }),
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createServiceRoleClient: () => fake,
}));

vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: { constructEvent: () => nextEvent },
    subscriptions: { retrieve: async () => retrievedSubscription },
  },
}));

const sendWelcomeReceiptEmail = vi.fn();
const sendPaymentFailedEmail = vi.fn();
const sendSubscriptionEndedEmail = vi.fn();
const sendOwnerNotificationEmail = vi.fn();

vi.mock("@/lib/email/notifications", () => ({
  sendWelcomeReceiptEmail: (...args: unknown[]) => sendWelcomeReceiptEmail(...args),
  sendPaymentFailedEmail: (...args: unknown[]) => sendPaymentFailedEmail(...args),
  sendSubscriptionEndedEmail: (...args: unknown[]) => sendSubscriptionEndedEmail(...args),
  sendOwnerNotificationEmail: (...args: unknown[]) => sendOwnerNotificationEmail(...args),
}));

const { POST } = await import("./route");

function makeRequest() {
  return new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    body: "{}",
    headers: { "stripe-signature": "test-signature" },
  });
}

function planSubscriptionObject(overrides: Record<string, unknown> = {}) {
  return {
    id: "sub_123",
    status: "active",
    metadata: { client_id: "client-1", kind: "plan_subscription", plan: "static", interval: "monthly" },
    items: { data: [{ price: { id: "price_static_monthly" }, current_period_end: 1_800_000_000 }] },
    ...overrides,
  };
}

beforeEach(() => {
  fake = createFakeSupabase({
    clients: [{ id: "client-1", email: "client@example.com", locale: "en" }],
  });
  signatureHeader = "test-signature";
  vi.clearAllMocks();
});

describe("Stripe webhook idempotency", () => {
  it("processes an event exactly once and short-circuits a redelivery with 200", async () => {
    nextEvent = { id: "evt_1", type: "customer.subscription.deleted", data: { object: planSubscriptionObject() } };
    retrievedSubscription = planSubscriptionObject();
    fake.tables.subscriptions = [{ stripe_subscription_id: "sub_123", status: "active" }];

    const first = await POST(makeRequest());
    expect(first.status).toBe(200);
    expect(fake.tables.subscriptions?.[0]?.status).toBe("canceled");

    fake.tables.subscriptions[0].status = "manually-changed";
    const second = await POST(makeRequest());
    expect(second.status).toBe(200);
    // A duplicate delivery must not re-run the handler.
    expect(fake.tables.subscriptions[0].status).toBe("manually-changed");
  });
});

describe("checkout.session.completed", () => {
  it("upserts the subscription row and resets edit tokens to 2 for a plan_subscription", async () => {
    const session = {
      metadata: { client_id: "client-1", kind: "plan_subscription", plan: "static", interval: "monthly" },
      subscription: "sub_123",
    };
    nextEvent = { id: "evt_2", type: "checkout.session.completed", data: { object: session } };
    retrievedSubscription = planSubscriptionObject();

    const res = await POST(makeRequest());

    expect(res.status).toBe(200);
    expect(fake.tables.subscriptions[0]).toMatchObject({
      client_id: "client-1",
      plan: "static",
      billing_interval: "monthly",
      status: "active",
    });
    expect(fake.tables.edit_tokens[0]).toMatchObject({ client_id: "client-1", balance: 2 });
  });
});

describe("invoice.paid", () => {
  it("resets tokens and sends the welcome email on the first invoice for a new subscription", async () => {
    const invoice = {
      billing_reason: "subscription_create",
      parent: { subscription_details: { subscription: "sub_123" } },
    };
    nextEvent = { id: "evt_3", type: "invoice.paid", data: { object: invoice } };
    retrievedSubscription = planSubscriptionObject();
    fake.tables.subscriptions = [{ stripe_subscription_id: "sub_123", status: "incomplete" }];

    const res = await POST(makeRequest());

    expect(res.status).toBe(200);
    expect(fake.tables.subscriptions[0].status).toBe("active");
    expect(fake.tables.edit_tokens[0]).toMatchObject({ client_id: "client-1", balance: 2 });
    expect(sendWelcomeReceiptEmail).toHaveBeenCalledOnce();
  });
});

describe("invoice.payment_failed", () => {
  it("marks the subscription past_due and emails the client", async () => {
    const invoice = { parent: { subscription_details: { subscription: "sub_123" } } };
    nextEvent = { id: "evt_4", type: "invoice.payment_failed", data: { object: invoice } };
    retrievedSubscription = planSubscriptionObject();
    fake.tables.subscriptions = [{ stripe_subscription_id: "sub_123", status: "active" }];

    const res = await POST(makeRequest());

    expect(res.status).toBe(200);
    expect(fake.tables.subscriptions[0].status).toBe("past_due");
    expect(sendPaymentFailedEmail).toHaveBeenCalledOnce();
  });
});

describe("handler failures", () => {
  it("returns 500 (not 200) so Stripe retries when a DB write fails", async () => {
    nextEvent = {
      id: "evt_5",
      type: "customer.subscription.deleted",
      data: { object: planSubscriptionObject() },
    };
    const originalFrom = fake.from.bind(fake);
    fake.from = (table: string) => {
      if (table === "subscriptions") {
        return { update: () => ({ eq: async () => ({ data: null, error: { message: "boom" } }) }) } as ReturnType<
          typeof originalFrom
        >;
      }
      return originalFrom(table);
    };

    const res = await POST(makeRequest());
    expect(res.status).toBe(500);
  });
});

describe("missing signature", () => {
  it("returns 400 without touching Stripe or the database", async () => {
    signatureHeader = null;
    const res = await POST(makeRequest());
    expect(res.status).toBe(400);
    expect(fake.tables.stripe_webhook_events ?? []).toHaveLength(0);
  });
});
