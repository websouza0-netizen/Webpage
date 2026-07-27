import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
  Hr,
} from "@react-email/components";

/**
 * Shared shell for every transactional email. Inline hex values only —
 * email clients can't reliably do CSS custom properties or dark mode, so
 * this hand-maps the .ws-editorial light palette rather than referencing
 * the app's CSS vars.
 */
const colors = {
  canvas: "#fbf9f4",
  surface: "#ffffff",
  ink: "#1a1a1b",
  muted: "#71717a",
  accent: "#8a6212",
  border: "#e4e4e7",
};

export function EmailLayout({
  preview,
  heading,
  children,
  ctaLabel,
  ctaHref,
}: {
  preview: string;
  heading: string;
  children: React.ReactNode;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: colors.canvas, fontFamily: "Helvetica, Arial, sans-serif" }}>
        <Container
          style={{
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            borderRadius: 12,
            margin: "40px auto",
            padding: 32,
            maxWidth: 480,
          }}
        >
          <Text style={{ color: colors.accent, fontSize: 13, fontWeight: 600, letterSpacing: 0.5, textTransform: "uppercase" }}>
            WebSouza
          </Text>
          <Heading style={{ color: colors.ink, fontSize: 22, margin: "12px 0 16px" }}>
            {heading}
          </Heading>
          <Section style={{ color: colors.ink, fontSize: 15, lineHeight: 1.6 }}>
            {children}
          </Section>
          {ctaLabel && ctaHref && (
            <Section style={{ marginTop: 24 }}>
              <Button
                href={ctaHref}
                style={{
                  backgroundColor: colors.ink,
                  color: colors.canvas,
                  borderRadius: 8,
                  padding: "12px 20px",
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                {ctaLabel}
              </Button>
            </Section>
          )}
          <Hr style={{ borderColor: colors.border, margin: "32px 0 16px" }} />
          <Text style={{ color: colors.muted, fontSize: 12 }}>
            WebSouza — bespoke websites, run for you.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
