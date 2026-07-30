-- Run if REST API returns 503 / "schema cache" errors after removing schema `qrra`.
-- PostgREST must not list schemas that do not exist.

ALTER ROLE authenticator SET pgrst.db_schemas TO 'public, storage, graphql_public';
NOTIFY pgrst, 'reload config';
NOTIFY pgrst, 'reload schema';
