-- The auth.users trigger `on_auth_user_created` / function `handle_new_user`
-- were created directly against the live database before this repo's
-- migration history existed, so they were never captured in a migration
-- file. When 0007 renamed clients.name -> clients.full_name, this function
-- was missed: every new signup (email or Google OAuth) has since failed at
-- the trigger with "column \"name\" of relation \"clients\" does not exist",
-- surfacing to users as "Database error saving new user". This migration
-- both fixes the column reference and formally records the trigger/function
-- so local files match live schema going forward.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  insert into public.clients (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.email
  )
  on conflict (id) do nothing;

  insert into public.edit_tokens (client_id, balance)
  values (new.id, 2)
  on conflict (client_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
