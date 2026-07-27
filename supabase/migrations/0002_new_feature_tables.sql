-- New tables for onboarding, delivery pipeline, transactional email log,
-- e-commerce sales ingestion, and Stripe webhook idempotency.

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

-- Idempotency ledger for every Stripe webhook handler, not just sales.
create table stripe_webhook_events (
  id text primary key,
  type text not null,
  created_at timestamptz not null default now()
);

-- Seed the fixed 7-step pipeline for both plans.
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
