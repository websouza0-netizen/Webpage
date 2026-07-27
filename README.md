# WebSouza

Marketing site, client dashboard, and admin console for a bespoke website-build
business: signup/checkout, Stripe subscriptions and one-off edit tokens, an
onboarding questionnaire, a delivery pipeline, transactional email, and
lightweight site-visit tracking for delivered client sites.

Next.js (App Router, Turbopack) + Supabase (Postgres, Auth, Storage) + Stripe +
Resend.

> This project pins to a pre-release Next.js version with breaking changes
> from the Next.js you may know (e.g. `middleware.ts` is `proxy.ts` here). See
> `AGENTS.md` before making framework-level changes.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in the values (see table
   below for where each one comes from).
3. Apply the SQL migrations in `supabase/migrations/` to your Supabase
   project, in order, via the Supabase SQL editor, the `supabase` CLI, or the
   Supabase MCP connector's `apply_migration` tool.
4. In the Supabase dashboard, confirm Auth -> Providers -> Google is
   configured if you want Google OAuth sign-in, and re-skin the
   password-recovery email template under Auth -> Email Templates.
5. Register a Stripe webhook endpoint pointing at
   `/api/webhooks/stripe` for: `checkout.session.completed`, `invoice.paid`,
   `invoice.payment_failed`, `customer.subscription.updated`,
   `customer.subscription.deleted`.
6. `npm run dev` and open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Source |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project Settings -> API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Project Settings -> API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Project Settings -> API (server-only, never expose client-side) |
| `STRIPE_SECRET_KEY` | Stripe Dashboard -> Developers -> API keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard -> Developers -> API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard -> Developers -> Webhooks (per-endpoint signing secret) |
| `STRIPE_PRICE_*` (7 vars) | Stripe Dashboard -> Product catalog, each price's API ID (`price_...`) |
| `RESEND_API_KEY` | resend.com/api-keys — optional, email sending logs to `email_log` and no-ops without it |
| `NEXT_PUBLIC_SENTRY_DSN` | sentry.io project settings — optional, error reporting no-ops without it |
| `NEXT_PUBLIC_APP_URL` | Your deployed URL (or `http://localhost:3000` in dev) |

## Database

Schema, RLS policies, and RPCs are versioned in `supabase/migrations/`. This
is the source of truth going forward — apply new schema changes as new
numbered migration files rather than editing the live database ad hoc.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm test` — Vitest (unit tests for webhook handlers and token/billing logic)

## Project structure

- `src/app` — routes: marketing site, `/dashboard`, `/admin`, auth, API routes
- `src/lib` — Supabase clients, Stripe, pricing, email, i18n
- `src/emails` — React Email templates (bilingual EN/PT)
- `supabase/migrations` — versioned SQL schema/RLS/RPCs
