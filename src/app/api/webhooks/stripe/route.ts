import { NextResponse } from "next/server";
import { headers } from "next/headers";
import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";
import { stripe } from "@/lib/stripe";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { clientIp, rateLimit, rateLimitResponse } from "@/lib/rate-limit";
import {
  sendWelcomeReceiptEmail,
  sendPaymentFailedEmail,
  sendSubscriptionEndedEmail,
  sendOwnerNotificationEmail,
} from "@/lib/email/notifications";

type SubscriptionMetadata = {
  client_id?: string;
  kind?: "plan_subscription" | "addon_subscription";
  plan?: "static" | "ecommerce";
  interval?: "monthly" | "annual";
  type?: "email_pro" | "manutencao";
};

export async function POST(request: Request) {
  // Generous limit: this only guards against someone hammering the public
  // endpoint directly, not legitimate Stripe delivery bursts.
  const { allowed, retryAfterSeconds } = rateLimit(`stripe-webhook:${clientIp(request)}`, {
    limit: 100,
    windowMs: 60_000,
  });
  if (!allowed) return rateLimitResponse(retryAfterSeconds);

  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return new NextResponse("missing signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Stripe webhook signature verification failed", err);
    return new NextResponse("invalid signature", { status: 400 });
  }

  const supabase = createServiceRoleClient();

  // Idempotency ledger: every event id is inserted exactly once. A
  // redelivery hits the unique constraint and short-circuits before any
  // side effect runs, so tokens/emails/status changes can never apply twice.
  const { error: idempotencyError } = await supabase
    .from("stripe_webhook_events")
    .insert({ id: event.id, type: event.type });

  if (idempotencyError) {
    if (idempotencyError.code === "23505") {
      return new NextResponse("ok (duplicate)", { status: 200 });
    }
    console.error("Failed to record webhook event", idempotencyError);
    return new NextResponse("event log failed", { status: 500 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(supabase, event.data.object as Stripe.Checkout.Session);
        break;
      case "invoice.paid":
        await handleInvoicePaid(supabase, event.data.object as Stripe.Invoice);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(supabase, event.data.object as Stripe.Invoice);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(supabase, event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(supabase, event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }
  } catch (err) {
    // Never return 200 on a failed write — Stripe will retry the event.
    console.error(`Stripe webhook handler failed for ${event.type}`, err);
    return new NextResponse("handler failed", { status: 500 });
  }

  return new NextResponse("ok", { status: 200 });
}

function subscriptionIdOf(ref: string | Stripe.Subscription | null | undefined): string | null {
  if (!ref) return null;
  return typeof ref === "string" ? ref : ref.id;
}

function invoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  return subscriptionIdOf(invoice.parent?.subscription_details?.subscription ?? null);
}

async function getClientContact(supabase: SupabaseClient, clientId: string) {
  const { data } = await supabase
    .from("clients")
    .select("email, locale")
    .eq("id", clientId)
    .single();
  return {
    email: (data?.email as string | undefined) ?? null,
    locale: ((data?.locale as "en" | "pt" | undefined) ?? "en") as "en" | "pt",
  };
}

async function handleCheckoutCompleted(supabase: SupabaseClient, session: Stripe.Checkout.Session) {
  const metadata = session.metadata as SubscriptionMetadata | null;
  const clientId = metadata?.client_id;
  if (!clientId) return;

  if (metadata?.kind === "plan_subscription") {
    const subscriptionId = subscriptionIdOf(session.subscription);
    if (!subscriptionId || !metadata.plan || !metadata.interval) return;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const item = subscription.items.data[0];

    const { error } = await supabase.from("subscriptions").upsert(
      {
        client_id: clientId,
        plan: metadata.plan,
        billing_interval: metadata.interval,
        stripe_subscription_id: subscription.id,
        stripe_price_id: item.price.id,
        status: subscription.status,
        current_period_end: item?.current_period_end
          ? new Date(item.current_period_end * 1000).toISOString()
          : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "stripe_subscription_id" },
    );
    if (error) throw error;

    const { error: tokenError } = await supabase
      .from("edit_tokens")
      .upsert(
        { client_id: clientId, balance: 2, updated_at: new Date().toISOString() },
        { onConflict: "client_id" },
      );
    if (tokenError) throw tokenError;

    // The welcome email fires from invoice.paid (billing_reason ===
    // 'subscription_create') instead of here, since both events land for
    // every new subscription and sending it in both places would double it.
  } else if (metadata?.kind === "addon_subscription") {
    const subscriptionId = subscriptionIdOf(session.subscription);
    if (!subscriptionId || !metadata.type) return;

    const { error } = await supabase.from("addons").upsert(
      {
        client_id: clientId,
        type: metadata.type,
        stripe_subscription_id: subscriptionId,
        status: "active",
      },
      { onConflict: "stripe_subscription_id" },
    );
    if (error) throw error;
  } else if (metadata?.kind === "edit_token") {
    const description = (session.metadata?.description as string | undefined) ?? "";
    const siteId = (session.metadata?.site_id as string | undefined) || null;
    const paymentIntentId =
      typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

    const { error } = await supabase.from("edit_requests").insert({
      client_id: clientId,
      site_id: siteId,
      description,
      consumed_token: true,
      stripe_payment_intent_id: paymentIntentId ?? null,
    });
    if (error) throw error;

    const { email } = await getClientContact(supabase, clientId);
    await sendOwnerNotificationEmail({
      detail: `New paid change request from ${email ?? clientId}: ${description}`,
    });
  }
}

async function handleInvoicePaid(supabase: SupabaseClient, invoice: Stripe.Invoice) {
  const subscriptionId = invoiceSubscriptionId(invoice);
  if (!subscriptionId) return; // one-off edit-token payments have no subscription

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const metadata = subscription.metadata as SubscriptionMetadata;
  const clientId = metadata?.client_id;
  if (!clientId) return;

  const item = subscription.items.data[0];
  const periodEnd = item?.current_period_end
    ? new Date(item.current_period_end * 1000).toISOString()
    : null;

  if (metadata.kind === "plan_subscription") {
    const { error } = await supabase
      .from("subscriptions")
      .update({ status: subscription.status, current_period_end: periodEnd, updated_at: new Date().toISOString() })
      .eq("stripe_subscription_id", subscription.id);
    if (error) throw error;

    // Reset (not accumulate) to 2 free edit tokens every billing period,
    // including this one.
    const { error: tokenError } = await supabase
      .from("edit_tokens")
      .upsert(
        { client_id: clientId, balance: 2, updated_at: new Date().toISOString() },
        { onConflict: "client_id" },
      );
    if (tokenError) throw tokenError;

    if (invoice.billing_reason === "subscription_create") {
      const { email, locale } = await getClientContact(supabase, clientId);
      if (email) {
        await sendWelcomeReceiptEmail({ to: email, clientId, locale });
      }
      await sendOwnerNotificationEmail({
        detail: `New ${metadata.plan} subscription (${metadata.interval}) from ${email ?? clientId}`,
      });
    }
  } else if (metadata.kind === "addon_subscription") {
    const { error } = await supabase
      .from("addons")
      .update({ status: "active" })
      .eq("stripe_subscription_id", subscription.id);
    if (error) throw error;
  }
}

async function handleInvoicePaymentFailed(supabase: SupabaseClient, invoice: Stripe.Invoice) {
  const subscriptionId = invoiceSubscriptionId(invoice);
  if (!subscriptionId) return;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const metadata = subscription.metadata as SubscriptionMetadata;
  const clientId = metadata?.client_id;
  if (!clientId) return;

  if (metadata.kind === "plan_subscription") {
    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "past_due", updated_at: new Date().toISOString() })
      .eq("stripe_subscription_id", subscription.id);
    if (error) throw error;

    const { email, locale } = await getClientContact(supabase, clientId);
    if (email) {
      await sendPaymentFailedEmail({ to: email, clientId, locale });
    }
  } else if (metadata.kind === "addon_subscription") {
    const { error } = await supabase
      .from("addons")
      .update({ status: "past_due" })
      .eq("stripe_subscription_id", subscription.id);
    if (error) throw error;
  }
}

async function handleSubscriptionDeleted(supabase: SupabaseClient, subscription: Stripe.Subscription) {
  const metadata = subscription.metadata as SubscriptionMetadata;
  const clientId = metadata?.client_id;
  if (!clientId) return;

  if (metadata.kind === "plan_subscription") {
    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "canceled", updated_at: new Date().toISOString() })
      .eq("stripe_subscription_id", subscription.id);
    if (error) throw error;

    const { email, locale } = await getClientContact(supabase, clientId);
    if (email) {
      await sendSubscriptionEndedEmail({ to: email, clientId, locale });
    }
  } else if (metadata.kind === "addon_subscription") {
    const { error } = await supabase
      .from("addons")
      .update({ status: "canceled" })
      .eq("stripe_subscription_id", subscription.id);
    if (error) throw error;
  }
}

async function handleSubscriptionUpdated(supabase: SupabaseClient, subscription: Stripe.Subscription) {
  const metadata = subscription.metadata as SubscriptionMetadata;
  const clientId = metadata?.client_id;
  if (!clientId) return;

  const item = subscription.items.data[0];
  const periodEnd = item?.current_period_end
    ? new Date(item.current_period_end * 1000).toISOString()
    : null;

  // Best-effort status sync for changes made outside our own flows (e.g.
  // via the Stripe Dashboard or customer billing portal). No email — the
  // dedicated events above cover the cases that should notify anyone.
  if (metadata.kind === "plan_subscription") {
    const { error } = await supabase
      .from("subscriptions")
      .update({ status: subscription.status, current_period_end: periodEnd, updated_at: new Date().toISOString() })
      .eq("stripe_subscription_id", subscription.id);
    if (error) throw error;
  } else if (metadata.kind === "addon_subscription") {
    const status = subscription.status === "active" ? "active" : subscription.status === "past_due" ? "past_due" : "canceled";
    const { error } = await supabase
      .from("addons")
      .update({ status })
      .eq("stripe_subscription_id", subscription.id);
    if (error) throw error;
  }
}
