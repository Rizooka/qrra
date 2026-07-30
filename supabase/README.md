# Supabase (QRRA)

QRRA uses **standard `public` tables** with prefix `qrra_`. No custom schema, no exposed-schema setting, no views.

## Apply migrations

Remote (already applied via dashboard MCP during setup):

- `supabase/migrations/20260330120000_qrra_public_init.sql`

Local CLI:

```bash
npx supabase link
npx supabase db push
```

## Tables

| Table | Purpose |
|-------|---------|
| `qrra_profiles` | User profile + `admin` / `customer` |
| `qrra_addresses` | Delivery addresses |
| `qrra_products` | Catalog (8 models seeded) |
| `qrra_orders` | Orders |
| `qrra_order_items` | Line items |

Trigger `qrra_on_auth_user_created` creates `qrra_profiles` on signup (name/phone from registration form).

## Vercel env

**Settings → API** in Supabase:

- `NEXT_PUBLIC_SUPABASE_URL` — Project URL `https://xxxx.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — `anon` `public` key

Not the Postgres connection string.

## Auth (shared project)

`auth.users` is shared with other apps on this Supabase project. Same email = same login; signup does not reset password.

- Password reset: `/forgot-password` on the site
- Redirect URLs: **Authentication → URL Configuration** — Site URL + `https://your-domain/**` and `/auth/callback`

## Admin

After you can log in:

```sql
update public.qrra_profiles
set role = 'admin'
where id = (select id from auth.users where email = 'your@email.com');
```

Log out and log in again. `/admin` should open.

## Reset QRRA data only

Use **`supabase/reset_qrra.sql`** (drops `qrra_*` **tables** — not `DROP VIEW`). Then re-apply the migration file from the `-- Tables` section, or `npx supabase db push`.

Does **not** delete `auth.users`.

## 503 / schema cache errors

If login works but `/rest/v1/qrra_*` returns **503** and the client says **Could not query the database for the schema cache**, PostgREST is often configured with a **missing schema** in `pgrst.db_schemas` (e.g. old `qrra` after we moved tables to `public`).

Run **`supabase/fix_postgrest_schema_cache.sql`** in SQL Editor, then reload the site.
