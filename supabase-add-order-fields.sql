-- Run this in Supabase → SQL Editor to add the phone-number field to orders.
alter table public.orders add column if not exists phone text;
