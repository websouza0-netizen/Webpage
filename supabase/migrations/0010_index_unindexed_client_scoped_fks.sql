-- Supabase performance advisor flagged these client_id/site_id foreign
-- keys as unindexed on the live DB. They're defined in 0001_core.sql, but
-- per the "live DB predates this app's rebuild" note in
-- 0007_reconcile_live_schema.sql, 0001-0006 never literally ran against
-- the live project — only 0007+ did. These are exactly the columns every
-- RLS policy and every dashboard-facing query filters on
-- (client_id = auth.uid(), or site_id via an owned-sites subquery), so
-- missing them compounds as the tables grow.
create index if not exists addons_client_id_idx on addons(client_id);
create index if not exists brief_assets_client_id_idx on brief_assets(client_id);
create index if not exists edit_requests_client_id_idx on edit_requests(client_id);
create index if not exists edit_requests_site_id_idx on edit_requests(site_id);
create index if not exists sites_client_id_idx on sites(client_id);
create index if not exists subscriptions_client_id_idx on subscriptions(client_id);
