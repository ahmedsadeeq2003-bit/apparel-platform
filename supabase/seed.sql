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

insert into public.product_colors (product_id, name, hex, front_mockup_url, back_mockup_url, is_active)
select p.id, c.name, c.hex, c.front_mockup_url, c.back_mockup_url, true
from public.products p
cross join (
  values
    ('Ash Grey', '#A8A69F', 'https://picsum.photos/seed/tee-ash-front/800/900', 'https://picsum.photos/seed/tee-ash-back/800/900'),
    ('Black', '#0B0B0C', 'https://picsum.photos/seed/tee-black-front/800/900', 'https://picsum.photos/seed/tee-black-back/800/900'),
    ('Volt Green', '#D7FF3E', 'https://picsum.photos/seed/tee-volt-front/800/900', 'https://picsum.photos/seed/tee-volt-back/800/900'),
    ('White', '#F4F2EC', 'https://picsum.photos/seed/tee-white-front/800/900', 'https://picsum.photos/seed/tee-white-back/800/900')
) as c(name, hex, front_mockup_url, back_mockup_url)
where p.slug = 'classic-tee'
  and not exists (
    select 1 from public.product_colors pc
    where pc.product_id = p.id and pc.name = c.name
  );
