-- Template/artwork library schema (M3b). Content lives in seed.sql, not
-- here -- this migration is schema only, matching the products/product_colors
-- convention already established.

create type public.template_print_area as enum ('front', 'back', 'front_and_back');

create table public.template_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table public.design_templates (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.template_categories (id) on delete cascade,
  name text not null,
  -- One of the 12 production/design categories (simple_text, text_small_graphic,
  -- large_front_graphic, full_color_illustration, photo_print, multiple_colors,
  -- front_and_back, small_chest_logo, large_back_print, detailed_artwork,
  -- minimal_design, oversized_front_print). Kept as plain text rather than an
  -- enum since this vocabulary will keep evolving as it starts informing
  -- production pricing.
  design_type text not null,
  print_area public.template_print_area not null default 'front',
  -- Fabric.js canvas-level JSON (same shape useDesignEditor.ts's toObject()/
  -- loadFromJSON() already round-trips for the front/back side swap) --
  -- encodes artwork content and its placement together, no separate format.
  canvas_json jsonb not null,
  back_canvas_json jsonb,
  colors text[] not null default '{}',
  tags text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index design_templates_category_id_idx on public.design_templates (category_id);

alter table public.template_categories enable row level security;
alter table public.design_templates enable row level security;

create policy template_categories_public_read_active
  on public.template_categories for select
  to anon, authenticated
  using (is_active = true);

create policy design_templates_public_read_active
  on public.design_templates for select
  to anon, authenticated
  using (is_active = true);
