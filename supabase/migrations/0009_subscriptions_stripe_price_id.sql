-- 0001_core.sql originally specified subscriptions.stripe_price_id as a
-- required column, but the live database (reconciled from a pre-rebuild
-- schema in 0007) never had it. The Stripe webhook handler
-- (handleCheckoutCompleted in src/app/api/webhooks/stripe/route.ts) has
-- always written this field on every subscription upsert and throws on
-- error, so every real subscription checkout was failing silently against
-- production. Table had 0 rows at the time of this fix, so adding it
-- NOT NULL is safe.
alter table subscriptions add column stripe_price_id text not null;
