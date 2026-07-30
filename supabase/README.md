# Supabase (QRRA)

## 1. Exposed schema `qrra`

Without this, the site cannot read `qrra.products`, orders, etc.

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project **toypirzbsarjockxfwwr** (or your linked project)
3. **Project Settings** (gear, bottom left) → **Data API**
4. Find **Exposed schemas** (sometimes under **API Settings**)
5. Add `qrra` next to `public`, save

Path may vary slightly: **Settings → API → Exposed schemas**.

## 2. Make yourself admin

Run SQL **after** you register on the site (so a row exists in `qrra.profiles`).

1. Dashboard → **SQL Editor** → **New query**
2. Get your user id:
   - **Authentication → Users** → open your user → copy **User UID**, or
   - SQL:

```sql
select id, email from auth.users order by created_at desc limit 5;
```

3. Run:

```sql
update qrra.profiles
set role = 'admin'
where id = 'PASTE-USER-UUID-HERE';
```

4. Check:

```sql
select id, full_name, role from qrra.profiles where role = 'admin';
```

Log out and log in again if `/admin` still redirects to `/account`.

## Vercel env vars

Supabase **Project Settings → API** (not Database → Connection string):

| Variable | Where |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | **Project URL** — `https://xxxx.supabase.co` only |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Project API keys** → `anon` `public` |

Wrong URL causes signup errors like **Invalid path specified in request URL** (often `/rest/v1` pasted into URL, or `postgresql://…`).

After fixing env in Vercel → **Deployments → Redeploy**.

See `.env.example` in the repo root.
