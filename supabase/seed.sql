-- Mirrors the remote-only "seed_classic_tee_product" migration
-- (20260811223715). Idempotent so `supabase db reset` can run repeatedly
-- against a local dev database without duplicating rows.

insert into public.products (slug, name, description, is_active)
values (
  'classic-tee',
  'Classic Tee',
  'A soft, everyday cotton T-shirt -- the canvas for your custom design.',
  true
)
on conflict (slug) do nothing;

-- No mockup URLs: the app renders a color-tinted SVG mockup (TShirtMockup)
-- from `hex` directly rather than a photographic mockup per color.
insert into public.product_colors (product_id, name, hex, is_active)
select p.id, c.name, c.hex, true
from public.products p
cross join (
  values
    ('Ash Grey', '#A8A69F'),
    ('Black', '#0B0B0C'),
    ('Volt Green', '#D7FF3E'),
    ('White', '#F4F2EC')
) as c(name, hex)
where p.slug = 'classic-tee'
  and not exists (
    select 1 from public.product_colors pc
    where pc.product_id = p.id and pc.name = c.name
  );
