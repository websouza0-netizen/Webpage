-- 0007 reconciled most live/app schema drift but missed `sites.name`: a
-- legacy NOT NULL column from the pre-rebuild schema that the current app
-- code has no concept of (provisionSite() never sets it). Same treatment
-- as clients.full_name in 0007 — drop the not-null constraint rather than
-- force every insert to invent a value for a column the app doesn't use.
alter table sites alter column name drop not null;
