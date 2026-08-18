-- Saved-design schema (Editor Phase 1). One row per design a signed-in
-- customer saves from the editor, holding both sides' Fabric canvas JSON
-- (same shape design_templates.canvas_json already uses) so a design can be
-- reloaded back into the editor exactly as left.

create table public.designs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  product_color_id uuid not null references public.product_colors (id) on delete cascade,
  name text not null default 'Untitled design',
  front_canvas_json jsonb,
  back_canvas_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index designs_user_id_idx on public.designs (user_id);
create index designs_product_id_idx on public.designs (product_id);

alter table public.designs enable row level security;

create policy designs_select_own
  on public.designs for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy designs_insert_own
  on public.designs for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy designs_update_own
  on public.designs for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy designs_delete_own
  on public.designs for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- Keeps `updated_at` honest on every save without relying on the client.
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger designs_set_updated_at
  before update on public.designs
  for each row execute function public.set_updated_at();
