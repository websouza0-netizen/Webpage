-- increment_edit_tokens and increment_site_visit_daily are SECURITY DEFINER
-- with no auth.uid() check and no callers anywhere in the app (verified against
-- src/). Left publicly executable, any anon/authenticated caller could grant
-- themselves free edit tokens or tamper with site analytics via PostgREST RPC.
-- Restrict to service_role only until/unless the app actually calls them.
revoke execute on function public.increment_edit_tokens(uuid, integer) from public, anon, authenticated;
revoke execute on function public.increment_site_visit_daily(uuid, date) from public, anon, authenticated;

-- Harden search_path per linter (function_search_path_mutable).
alter function public.is_admin() set search_path = public;
