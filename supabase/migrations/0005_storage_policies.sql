-- Storage RLS for the `client-assets` bucket (onboarding logo/photo
-- uploads). The bucket itself must be created manually in the Supabase
-- Dashboard (Storage → New bucket → "client-assets", private) — bucket
-- creation isn't something a SQL migration can do.
--
-- Objects are stored at `{client_id}/{uuid}-{filename}`, so ownership is
-- just the first path segment. Admin brief-detail views read assets via
-- signed URLs generated server-side with the service-role client, which
-- bypasses these policies entirely — no separate admin policy needed.

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
