-- ============================================================
--  Khalil Studio — Supabase setup
--  Run this once in: Supabase → SQL Editor → New query → Run
-- ============================================================

-- 1) Profiles (one row per account; lets the admin list all clients)
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text,
  email      text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;

-- 2) Orders
create table if not exists public.orders (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references auth.users(id) on delete cascade,
  name       text,
  email      text,
  phone      text,
  service    text,
  brief      text,
  timeline   text,
  status     text default 'new',
  created_at timestamptz default now()
);
alter table public.orders enable row level security;

-- 3) Auto-create a profile row whenever someone signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name',''), new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4) Row-level security policies
--    (admin email gets full read access; clients see only their own data)

-- profiles
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
  using ( auth.uid() = id or (auth.jwt()->>'email') = 'khalilmhamdi4work@gmail.com' );

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update
  using ( auth.uid() = id );

-- orders
drop policy if exists orders_insert on public.orders;
create policy orders_insert on public.orders for insert
  with check ( auth.uid() = user_id );

drop policy if exists orders_select on public.orders;
create policy orders_select on public.orders for select
  using ( auth.uid() = user_id or (auth.jwt()->>'email') = 'khalilmhamdi4work@gmail.com' );

drop policy if exists orders_update on public.orders;
create policy orders_update on public.orders for update
  using ( (auth.jwt()->>'email') = 'khalilmhamdi4work@gmail.com' );

-- Done. (If you ever change the admin email, update it in the 3 policies above.)
