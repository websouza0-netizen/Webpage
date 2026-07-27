-- RPCs. security definer functions pin search_path to prevent hijacking
-- and rely on auth.uid() (never a caller-supplied id) so a client can only
-- ever act on their own rows through these.

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

-- Returns the new balance, or null if the client had none left.
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

-- Reconstructed existing RPC: tracking snippet calls this (via the
-- service-role-backed /api ingestion route, not directly) to bump the
-- daily visit counter for a site.
create or replace function increment_site_visit_daily(p_site_id uuid, p_day date)
returns void
language sql
set search_path = public, pg_temp
as $$
  insert into site_visit_daily (site_id, day, count)
  values (p_site_id, p_day, 1)
  on conflict (site_id, day) do update set count = site_visit_daily.count + 1;
$$;

-- Reconstructed existing RPC: additive token grant (e.g. a one-off
-- STRIPE_PRICE_EDIT_TOKEN purchase), distinct from the invoice.paid
-- reset-to-2 which is a plain UPDATE in the webhook handler.
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
