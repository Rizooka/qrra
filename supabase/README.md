-- QRRA seed / schema reference
-- Dashboard → Settings → API → Exposed schemas → add `qrra`

-- Products already seeded in remote DB. Re-seed example:
-- insert into qrra.products (slug, name, price, ...) ...

-- Make yourself admin after signup:
-- update qrra.profiles set role = 'admin' where id = '<user-uuid>';
