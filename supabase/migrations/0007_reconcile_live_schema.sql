-- Reconciles the live database (which predates this app's rebuild and
-- already has 2 real client rows) with the schema the current app code
-- and RLS/RPC design actually expect. Every column change is a RENAME
-- (preserves existing data) rather than drop+recreate. See the
-- "schema drift" discussion in project history for how this diverged:
-- the codebase was rebuilt against a freshly-authored schema without
-- being able to inspect the live database at the time.

-- ---- renames (data-preserving) ----
alter table clients rename column name to full_name;
alter table clients alter column full_name drop not null;
alter table subscriptions rename column plan_type to plan;
alter table sites rename column plan_type to plan;
alter table edit_requests rename column charged to consumed_token;
alter table site_visit_daily rename column visit_count to count;
alter table edit_tokens rename column granted_at to updated_at;

-- ---- new columns ----
alter table clients add column locale text not null default 'en' check (locale in ('en', 'pt'));
alter table sites add column ingest_token uuid not null default gen_random_uuid() unique;

-- ---- status vocab fixes (0 rows in sites/edit_requests live, safe) ----
alter table sites drop constraint sites_status_check;
alter table sites alter column status set default 'active';
alter table sites add constraint sites_status_check check (status in ('active', 'archived'));

alter table edit_requests drop constraint edit_requests_status_check;
alter table edit_requests alter column status set default 'new';
alter table edit_requests add constraint edit_requests_status_check check (status in ('new', 'in_progress', 'done'));

-- ---- new tables the app code depends on (none existed live) ----
create table onboarding_briefs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique references clients(id) on delete cascade,
  brand_name text not null,
  one_liner text not null,
  long_description text,
  theme_preference text check (
    theme_preference in ('minimal', 'bold', 'elegant', 'playful', 'corporate', 'surprise_me')
  ),
  theme_notes text,
  brand_colors text[] check (array_length(brand_colors, 1) <= 3),
  reference_urls text[] check (array_length(reference_urls, 1) <= 3),
  pages_needed text[] not null default '{}',
  domain_choice text check (domain_choice in ('has_domain', 'need_domain')),
  domain_value text,
  social_links jsonb not null default '{}',
  contact_name text,
  contact_phone text,
  contact_email text not null,
  ecommerce_product_count int,
  ecommerce_payment_methods text[],
  ecommerce_shipping_needed boolean,
  locked_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table brief_assets (
  id uuid primary key default gen_random_uuid(),
  brief_id uuid not null references onboarding_briefs(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  storage_path text not null,
  kind text not null check (kind in ('logo', 'photo')),
  file_name text not null,
  size_bytes int not null,
  created_at timestamptz not null default now()
);
create index brief_assets_brief_id_idx on brief_assets(brief_id);

create table delivery_step_templates (
  id uuid primary key default gen_random_uuid(),
  plan text not null check (plan in ('static', 'ecommerce')),
  step_key text not null,
  step_order int not null,
  title_en text not null,
  title_pt text not null,
  unique (plan, step_key)
);

create table delivery_steps (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  step_key text not null,
  step_order int not null,
  title_en text not null,
  title_pt text not null,
  status text not null default 'pending' check (status in ('pending', 'done')),
  note text,
  link text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (client_id, step_key)
);
create index delivery_steps_client_id_idx on delivery_steps(client_id);

create table email_log (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete set null,
  recipient text not null,
  template text not null,
  locale text not null,
  status text not null check (status in ('sent', 'failed')),
  provider_message_id text,
  error text,
  created_at timestamptz not null default now()
);
create index email_log_client_id_idx on email_log(client_id);

create table site_sales (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  order_id text not null,
  amount_cents int not null,
  currency text not null default 'eur',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, order_id)
);
create index site_sales_site_id_idx on site_sales(site_id);

create table stripe_webhook_events (
  id text primary key,
  type text not null,
  created_at timestamptz not null default now()
);

insert into delivery_step_templates (plan, step_key, step_order, title_en, title_pt) values
  ('static', 'brief_received', 1, 'Brief received', 'Briefing recebido'),
  ('static', 'design_draft', 2, 'Design draft sent', 'Rascunho de design enviado'),
  ('static', 'in_development', 3, 'In development', 'Em desenvolvimento'),
  ('static', 'client_review', 4, 'Client review', 'Revisão do cliente'),
  ('static', 'revisions', 5, 'Revisions', 'Revisões'),
  ('static', 'launched', 6, 'Launched', 'Lançado'),
  ('static', 'post_launch', 7, 'Post-launch check-in', 'Check-in pós-lançamento'),
  ('ecommerce', 'brief_received', 1, 'Brief received', 'Briefing recebido'),
  ('ecommerce', 'design_draft', 2, 'Design draft sent', 'Rascunho de design enviado'),
  ('ecommerce', 'in_development', 3, 'In development', 'Em desenvolvimento'),
  ('ecommerce', 'client_review', 4, 'Client review', 'Revisão do cliente'),
  ('ecommerce', 'revisions', 5, 'Revisions', 'Revisões'),
  ('ecommerce', 'launched', 6, 'Launched', 'Lançado'),
  ('ecommerce', 'post_launch', 7, 'Post-launch check-in', 'Check-in pós-lançamento');

-- ---- RLS for the new tables only (existing tables already have live
-- policies more advanced than this repo's 0003 file — an is_admin()-aware
-- design — so those are left untouched) ----
alter table onboarding_briefs enable row level security;
create policy briefs_select_own on onboarding_briefs for select using (client_id = auth.uid() or is_admin());
create policy briefs_insert_own on onboarding_briefs for insert with check (client_id = auth.uid());
create policy briefs_update_own_unlocked on onboarding_briefs for update using (
  (client_id = auth.uid() and locked_at is null) or is_admin()
);

alter table brief_assets enable row level security;
create policy brief_assets_select_own on brief_assets for select using (client_id = auth.uid() or is_admin());
create policy brief_assets_insert_own on brief_assets for insert with check (client_id = auth.uid());
create policy brief_assets_delete_own on brief_assets for delete using (
  client_id = auth.uid()
  and exists (
    select 1 from onboarding_briefs b
    where b.id = brief_assets.brief_id and b.locked_at is null
  )
);

alter table delivery_steps enable row level security;
create policy delivery_steps_select_own on delivery_steps for select using (client_id = auth.uid() or is_admin());

alter table site_sales enable row level security;
create policy site_sales_select_own on site_sales for select using (
  is_admin() or site_id in (select id from sites where client_id = auth.uid())
);

alter table delivery_step_templates enable row level security;
alter table email_log enable row level security;
alter table stripe_webhook_events enable row level security;

-- ---- RPCs: redefine the two existing ones to use the renamed columns,
-- and add the two the app already calls (proxy.ts, dashboard/requests)
-- that never existed live ----
create or replace function onboarding_gate_status()
returns table (has_active_sub boolean, has_brief boolean, brief_locked boolean)
language sql
security definer
set search_path = public, pg_temp
as $$
  select
    exists(
      select 1 from subscriptions
      where client_id = auth.uid() and status in ('active', 'trialing')
    ),
    exists(select 1 from onboarding_briefs where client_id = auth.uid()),
    exists(
      select 1 from onboarding_briefs
      where client_id = auth.uid() and locked_at is not null
    );
$$;

create or replace function consume_edit_token(p_client_id uuid)
returns int
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_balance int;
begin
  if p_client_id <> auth.uid() then
    raise exception 'not authorized';
  end if;

  update edit_tokens
  set balance = balance - 1, updated_at = now()
  where client_id = p_client_id and balance > 0
  returning balance into v_balance;

  return v_balance;
end;
$$;

create or replace function increment_site_visit_daily(p_site_id uuid, p_day date)
returns void
language sql
set search_path = public, pg_temp
as $$
  insert into site_visit_daily (site_id, day, count)
  values (p_site_id, p_day, 1)
  on conflict (site_id, day) do update set count = site_visit_daily.count + 1;
$$;

create or replace function increment_edit_tokens(p_client_id uuid, p_amount int)
returns void
language sql
set search_path = public, pg_temp
as $$
  insert into edit_tokens (client_id, balance)
  values (p_client_id, p_amount)
  on conflict (client_id) do update
    set balance = edit_tokens.balance + p_amount, updated_at = now();
$$;
