-- Full QRRA reset (tables only). Does NOT delete auth.users.
-- Run in Supabase SQL Editor, then run the CREATE section from
-- migrations/20260330120000_qrra_public_init.sql (from "-- Tables" onward)
-- OR use: npx supabase db push

DROP TABLE IF EXISTS public.qrra_order_items CASCADE;
DROP TABLE IF EXISTS public.qrra_orders CASCADE;
DROP TABLE IF EXISTS public.qrra_addresses CASCADE;
DROP TABLE IF EXISTS public.qrra_products CASCADE;
DROP TABLE IF EXISTS public.qrra_profiles CASCADE;

DROP SCHEMA IF EXISTS qrra CASCADE;

DROP FUNCTION IF EXISTS public.qrra_is_admin();
DROP FUNCTION IF EXISTS public.qrra_handle_new_user();
