-- Baseline migration: captures the schema already applied to the remote
-- project (bkdyazlxervqwhnpfbiv) via the following remote-only migrations,
-- hand-reconstructed here from live introspection because this environment
-- has no Docker (supabase db pull/dump both require it for pg_dump):
--   20260811223655  create_profiles_products_schema
--   20260811223715  seed_classic_tee_product   (-> see supabase/seed.sql)
--   20260811223754  harden_profiles_policies_and_trigger_fn
-- Remote migration history was repaired (marked reverted) so this file
-- could be tracked as version 20260812004404 going forward.

create type public.user_role as enum ('customer', 'admin');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.product_colors (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  name text not null,
  hex text not null,
  front_mockup_url text,
  back_mockup_url text,
  is_active boolean not null default true
);

create index product_colors_product_id_idx on public.product_colors (product_id);

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.product_colors enable row level security;

create policy profiles_select_own
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy profiles_update_own
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy products_public_read_active
  on public.products for select
  to anon, authenticated
  using (is_active = true);

create policy product_colors_public_read_active
  on public.product_colors for select
  to anon, authenticated
  using (is_active = true);

-- Creates a profiles row whenever a new auth.users row is inserted (signup).
-- SECURITY DEFINER + fixed search_path so it can write to public.profiles
-- regardless of the inserting session's RLS context.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
