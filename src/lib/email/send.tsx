import { render } from "@react-email/render";
import { getResendClient, EMAIL_FROM } from "./resend";
import { emailCopy, type EmailTemplate, type Locale } from "./copy";
import { TransactionalEmail } from "@/emails/transactional-email";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * Renders + sends one transactional email and always writes an
 * `email_log` row, whether or not the send succeeded — including when
 * RESEND_API_KEY isn't configured yet, which logs a `failed` row instead
 * of throwing, so callers (webhooks, server actions) never have to guard
 * against a missing key themselves.
 */
export async function sendTransactionalEmail(opts: {
  to: string;
  clientId?: string | null;
  template: EmailTemplate;
  locale: Locale;
  detail?: string;
  ctaHref?: string;
}) {
  const { to, clientId = null, template, locale, detail, ctaHref } = opts;
  const supabase = createServiceRoleClient();
  const copy = emailCopy[locale][template];
  const resend = getResendClient();

  if (!resend) {
    await supabase.from("email_log").insert({
      client_id: clientId,
      recipient: to,
      template,
      locale,
      status: "failed",
      error: "RESEND_API_KEY not configured",
    });
    return;
  }

  try {
    const html = await render(
      <TransactionalEmail template={template} locale={locale} detail={detail} ctaHref={ctaHref} />,
    );
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: copy.subject,
      html,
    });

    if (error) {
      await supabase.from("email_log").insert({
        client_id: clientId,
        recipient: to,
        template,
        locale,
        status: "failed",
        error: error.message,
      });
      return;
    }

    await supabase.from("email_log").insert({
      client_id: clientId,
      recipient: to,
      template,
      locale,
      status: "sent",
      provider_message_id: data?.id ?? null,
    });
  } catch (err) {
    await supabase.from("email_log").insert({
      client_id: clientId,
      recipient: to,
      template,
      locale,
      status: "failed",
      error: err instanceof Error ? err.message : "unknown error",
    });
  }
}
