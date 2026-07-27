-- Row-level security. Convention: client-owned tables use
-- `client_id = auth.uid()` directly (clients.id IS the auth user id, no
-- join needed). Site-scoped tables resolve ownership through `sites`.
-- Admin-only tables (delivery_step_templates, email_log,
-- stripe_webhook_events) get RLS enabled with ZERO policies for
-- authenticated/anon — only the service-role key (which bypasses RLS
-- entirely) can read or write them, used from webhook handlers and admin
-- server routes.

alter table clients enable row level security;
create policy clients_select_own on clients for select using (id = auth.uid());
create policy clients_update_own on clients for update using (id = auth.uid());

alter table subscriptions enable row level security;
create policy subscriptions_select_own on subscriptions for select using (client_id = auth.uid());

alter table addons enable row level security;
create policy addons_select_own on addons for select using (client_id = auth.uid());

alter table edit_tokens enable row level security;
create policy edit_tokens_select_own on edit_tokens for select using (client_id = auth.uid());

alter table sites enable row level security;
create policy sites_select_own on sites for select using (client_id = auth.uid());

alter table site_visits enable row level security;
create policy site_visits_select_own on site_visits for select using (
  site_id in (select id from sites where client_id = auth.uid())
);

alter table site_visit_daily enable row level security;
create policy site_visit_daily_select_own on site_visit_daily for select using (
  site_id in (select id from sites where client_id = auth.uid())
);

alter table edit_requests enable row level security;
create policy edit_requests_select_own on edit_requests for select using (client_id = auth.uid());
create policy edit_requests_insert_own on edit_requests for insert with check (client_id = auth.uid());

alter table admins enable row level security;
create policy admins_select_own on admins for select using (user_id = auth.uid());

alter table onboarding_briefs enable row level security;
create policy briefs_select_own on onboarding_briefs for select using (client_id = auth.uid());
create policy briefs_insert_own on onboarding_briefs for insert with check (client_id = auth.uid());
create policy briefs_update_own_unlocked on onboarding_briefs for update using (
  client_id = auth.uid() and locked_at is null
);

alter table brief_assets enable row level security;
create policy brief_assets_select_own on brief_assets for select using (client_id = auth.uid());
create policy brief_assets_insert_own on brief_assets for insert with check (client_id = auth.uid());
create policy brief_assets_delete_own on brief_assets for delete using (
  client_id = auth.uid()
  and exists (
    select 1 from onboarding_briefs b
    where b.id = brief_assets.brief_id and b.locked_at is null
  )
);

alter table delivery_steps enable row level security;
create policy delivery_steps_select_own on delivery_steps for select using (client_id = auth.uid());

alter table site_sales enable row level security;
create policy site_sales_select_own on site_sales for select using (
  site_id in (select id from sites where client_id = auth.uid())
);

-- Admin-only, service-role-only tables: RLS on, no policies at all.
alter table delivery_step_templates enable row level security;
alter table email_log enable row level security;
alter table stripe_webhook_events enable row level security;
