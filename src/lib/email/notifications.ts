import { sendTransactionalEmail } from "./send";
import { OWNER_EMAIL } from "./resend";
import type { EmailTemplate, Locale } from "./copy";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

type Recipient = { to: string; clientId: string; locale: Locale };

export function sendWelcomeReceiptEmail({ to, clientId, locale }: Recipient) {
  return sendTransactionalEmail({
    to,
    clientId,
    locale,
    template: "welcome_receipt",
    ctaHref: `${APP_URL}/onboarding`,
  });
}

export function sendBriefReceivedEmail({ to, clientId, locale }: Recipient) {
  return sendTransactionalEmail({
    to,
    clientId,
    locale,
    template: "brief_received",
    ctaHref: `${APP_URL}/dashboard/brief`,
  });
}

/**
 * Maps a delivery_steps.step_key to the email template that should fire
 * when it's marked done. `revisions` intentionally has no template — the
 * spec's 10 email templates don't include one; the admin communicates via
 * the step's note/link field instead.
 */
const STEP_EMAIL_MAP: Record<string, EmailTemplate | null> = {
  brief_received: null, // already emailed via sendBriefReceivedEmail on submission
  design_draft: "design_draft_ready",
  in_development: "in_development",
  client_review: "ready_for_review",
  revisions: null,
  launched: "live",
  post_launch: "post_launch",
};

export function sendDeliveryStepEmail({
  to,
  clientId,
  locale,
  stepKey,
  note,
}: Recipient & { stepKey: string; note?: string | null }) {
  const template = STEP_EMAIL_MAP[stepKey];
  if (!template) return Promise.resolve();
  return sendTransactionalEmail({
    to,
    clientId,
    locale,
    template,
    detail: note ?? undefined,
    ctaHref: `${APP_URL}/dashboard`,
  });
}

export function sendEditRequestStatusEmail({
  to,
  clientId,
  locale,
  status,
}: Recipient & { status: string }) {
  return sendTransactionalEmail({
    to,
    clientId,
    locale,
    template: "edit_request_status",
    detail: status,
    ctaHref: `${APP_URL}/dashboard/requests`,
  });
}

export function sendPaymentFailedEmail({ to, clientId, locale }: Recipient) {
  return sendTransactionalEmail({
    to,
    clientId,
    locale,
    template: "payment_failed",
    ctaHref: `${APP_URL}/dashboard/billing`,
  });
}

export function sendSubscriptionEndedEmail({ to, clientId, locale }: Recipient) {
  return sendTransactionalEmail({
    to,
    clientId,
    locale,
    template: "subscription_ended",
    ctaHref: `${APP_URL}/dashboard/billing`,
  });
}

export function sendOwnerNotificationEmail({ detail }: { detail: string }) {
  return sendTransactionalEmail({
    to: OWNER_EMAIL,
    clientId: null,
    locale: "en",
    template: "owner_notification",
    detail,
    ctaHref: `${APP_URL}/admin`,
  });
}
