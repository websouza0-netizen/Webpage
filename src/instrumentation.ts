import * as Sentry from "@sentry/nextjs";

// No-op until NEXT_PUBLIC_SENTRY_DSN is set (same degrade-gracefully pattern
// as RESEND_API_KEY) — deliberately not wrapping next.config.ts with
// withSentryConfig, since that needs a SENTRY_AUTH_TOKEN for source-map
// upload that this project doesn't have configured yet.
export function register() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
  });
}

export const onRequestError = Sentry.captureRequestError;
