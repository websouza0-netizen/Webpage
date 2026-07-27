import { Text } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";
import { emailCopy, type EmailTemplate, type Locale } from "@/lib/email/copy";

export function TransactionalEmail({
  template,
  locale,
  detail,
  ctaHref,
}: {
  template: EmailTemplate;
  locale: Locale;
  detail?: string;
  ctaHref?: string;
}) {
  const copy = emailCopy[locale][template];

  return (
    <EmailLayout preview={copy.subject} heading={copy.heading} ctaLabel={copy.cta} ctaHref={ctaHref}>
      <Text>{copy.body}</Text>
      {detail && <Text style={{ fontWeight: 600 }}>{detail}</Text>}
    </EmailLayout>
  );
}
