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
  const detailParagraphs = detail?.split("\n\n").filter(Boolean) ?? [];

  return (
    <EmailLayout preview={copy.subject} heading={copy.heading} ctaLabel={copy.cta} ctaHref={ctaHref}>
      <Text>{copy.body}</Text>
      {detailParagraphs.map((paragraph, i) => (
        <Text key={i} style={{ fontWeight: 600 }}>
          {paragraph}
        </Text>
      ))}
    </EmailLayout>
  );
}
