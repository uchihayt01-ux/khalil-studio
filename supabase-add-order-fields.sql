-- Run this in Supabase → SQL Editor to add the new order fields
-- (phone number, number of pages/screens, and chosen add-ons).
alter table public.orders add column if not exists phone  text;
alter table public.orders add column if not exists pages  integer default 1;
alter table public.orders add column if not exists addons text;
