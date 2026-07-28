-- clients row creation happens synchronously inside the on_auth_user_created
-- trigger, at signUp() time — before email confirmation, and before any
-- client-side bootstrap call ever runs. That meant a user's language choice
-- on the signup screen never reached clients.locale: the trigger always
-- defaulted it to 'en'. The signup form now passes { data: { locale } } as
-- signUp() metadata, so raw_user_meta_data carries it through to the trigger.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  insert into public.clients (id, full_name, email, locale)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.email,
    case when new.raw_user_meta_data->>'locale' = 'pt' then 'pt' else 'en' end
  )
  on conflict (id) do nothing;

  insert into public.edit_tokens (client_id, balance)
  values (new.id, 2)
  on conflict (client_id) do nothing;

  return new;
end;
$$;
