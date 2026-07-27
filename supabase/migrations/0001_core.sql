-- Core schema: reconstructs the previously-live-only tables for the
-- WebSouza platform (clients, subscriptions, addons, edit tokens, sites,
-- visit tracking, edit requests, admins allowlist).
--
-- clients.id IS the auth user id (not a separate user_id column), so every
-- downstream client_id FK is directly comparable to auth.uid() with no join.

create extension if not exists "pgcrypto";

create table clients (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  locale text not null default 'en' check (locale in ('en', 'pt')),
  stripe_customer_id text unique,
  created_at timestamptz not null default now()
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  plan text not null check (plan in ('static', 'ecommerce')),
  billing_interval text not null check (billing_interval in ('monthly', 'annual')),
  stripe_subscription_id text unique not null,
  stripe_price_id text not null,
  status text not null check (status in ('trialing', 'active', 'past_due', 'canceled', 'incomplete')),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index subscriptions_client_id_idx on subscriptions(client_id);

create table addons (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  type text not null check (type in ('email_pro', 'manutencao')),
  stripe_subscription_id text unique not null,
  status text not null check (status in ('active', 'past_due', 'canceled')),
  created_at timestamptz not null default now()
);
create index addons_client_id_idx on addons(client_id);

create table edit_tokens (
  client_id uuid primary key references clients(id) on delete cascade,
  balance int not null default 2,
  updated_at timestamptz not null default now()
);

create table sites (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  domain text not null,
  plan text not null check (plan in ('static', 'ecommerce')),
  tracking_snippet_id uuid not null default gen_random_uuid() unique,
  ingest_token uuid not null default gen_random_uuid() unique,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now()
);
create index sites_client_id_idx on sites(client_id);

create table site_visits (
  id bigint generated always as identity primary key,
  site_id uuid not null references sites(id) on delete cascade,
  path text,
  referrer text,
  created_at timestamptz not null default now()
);
create index site_visits_site_id_idx on site_visits(site_id);

create table site_visit_daily (
  site_id uuid not null references sites(id) on delete cascade,
  day date not null,
  count int not null default 0,
  primary key (site_id, day)
);

create table edit_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  site_id uuid references sites(id) on delete set null,
  description text not null,
  status text not null default 'new' check (status in ('new', 'in_progress', 'done')),
  consumed_token boolean not null default false,
  stripe_payment_intent_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index edit_requests_client_id_idx on edit_requests(client_id);

create table admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
