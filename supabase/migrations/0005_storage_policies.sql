-- Storage RLS for the `client-assets` bucket (onboarding logo/photo
-- uploads). The bucket itself is created here too, via storage.buckets —
-- contrary to older Supabase docs, this works fine in a SQL migration.
--
-- Objects are stored at `{client_id}/{uuid}-{filename}`, so ownership is
-- just the first path segment. Admin brief-detail views read assets via
-- signed URLs generated server-side with the service-role client, which
-- bypasses these policies entirely — no separate admin policy needed.

insert into storage.buckets (id, name, public)
values ('client-assets', 'client-assets', false)
on conflict (id) do nothing;

create policy client_assets_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'client-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy client_assets_select_own on storage.objects
  for select to authenticated
  using (
    bucket_id = 'client-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy client_assets_delete_own on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'client-assets'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
