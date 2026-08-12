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

-- Template categories (homepage "Start with inspiration" categories).
insert into public.template_categories (slug, name, sort_order)
values
  ('minimal', 'Minimal', 0),
  ('streetwear', 'Streetwear', 1),
  ('motivational', 'Motivational', 2),
  ('funny', 'Funny', 3),
  ('birthday', 'Birthday', 4),
  ('couples', 'Couples', 5),
  ('graduation', 'Graduation', 6),
  ('football', 'Football', 7),
  ('business', 'Business', 8),
  ('events', 'Events', 9)
on conflict (slug) do nothing;

-- First template batch: one per category, covering 10 of the 12 production
-- design_type values (photo_print and multiple_colors deliberately deferred --
-- see docs/architecture-plan.md and the M3b plan for why). canvas_json is
-- Fabric.js canvas-level JSON (same shape useDesignEditor.ts's toObject()/
-- loadFromJSON() already round-trips), objects positioned in the same
-- 600x600 space the editor canvas uses.
insert into public.design_templates (category_id, name, design_type, print_area, canvas_json, colors, tags)
select tc.id, t.name, t.design_type, t.print_area::public.template_print_area, t.canvas_json::jsonb, t.colors, t.tags
from public.template_categories tc
join (
  values
    ('minimal', 'Less Is More', 'minimal_design', 'front',
      $$
      {"version":"7.4.0","objects":[
        {"id":"a1","type":"IText","left":300,"top":300,"originX":"center","originY":"center","fontSize":36,"fontFamily":"Archivo, sans-serif","fontWeight":600,"fill":"#0B0B0C","text":"LESS IS MORE","textAlign":"center"}
      ]}
      $$,
      array['#F4F2EC','#A8A69F'], array['minimal','wordmark']),

    ('streetwear', 'Run The Streets', 'large_front_graphic', 'front',
      $$
      {"version":"7.4.0","objects":[
        {"id":"b1","type":"Triangle","left":300,"top":230,"originX":"center","originY":"center","width":160,"height":140,"fill":"#D7FF3E"},
        {"id":"b2","type":"IText","left":300,"top":350,"originX":"center","originY":"center","fontSize":40,"fontFamily":"Anton, sans-serif","fontWeight":400,"fill":"#0B0B0C","text":"RUN THE\nSTREETS","textAlign":"center"}
      ]}
      $$,
      array['#0B0B0C'], array['bold','streetwear','graphic']),

    ('motivational', 'Progress Not Perfection', 'simple_text', 'front',
      $$
      {"version":"7.4.0","objects":[
        {"id":"c1","type":"IText","left":300,"top":300,"originX":"center","originY":"center","fontSize":34,"fontFamily":"Archivo, sans-serif","fontWeight":700,"fill":"#0B0B0C","text":"PROGRESS\nNOT PERFECTION","textAlign":"center"}
      ]}
      $$,
      array['#F4F2EC','#D7FF3E'], array['motivational','quote']),

    ('funny', 'Sarcasm Loading', 'text_small_graphic', 'front',
      $$
      {"version":"7.4.0","objects":[
        {"id":"d1","type":"IText","left":300,"top":280,"originX":"center","originY":"center","fontSize":30,"fontFamily":"Archivo, sans-serif","fontWeight":600,"fill":"#0B0B0C","text":"SARCASM\nLOADING...","textAlign":"center"},
        {"id":"d2","type":"Circle","left":260,"top":340,"originX":"center","originY":"center","radius":6,"fill":"#0B0B0C"},
        {"id":"d3","type":"Circle","left":300,"top":340,"originX":"center","originY":"center","radius":6,"fill":"#0B0B0C"},
        {"id":"d4","type":"Circle","left":340,"top":340,"originX":"center","originY":"center","radius":6,"fill":"#0B0B0C"}
      ]}
      $$,
      array['#F4F2EC','#A8A69F'], array['funny','joke']),

    ('birthday', 'It''s My Birthday', 'small_chest_logo', 'front',
      $$
      {"version":"7.4.0","objects":[
        {"id":"e1","type":"Circle","left":220,"top":220,"originX":"center","originY":"center","radius":48,"fill":null,"stroke":"#0B0B0C","strokeWidth":3},
        {"id":"e2","type":"IText","left":220,"top":220,"originX":"center","originY":"center","fontSize":16,"fontFamily":"Archivo, sans-serif","fontWeight":700,"fill":"#0B0B0C","text":"IT'S MY\nBIRTHDAY","textAlign":"center"}
      ]}
      $$,
      array['#F4F2EC','#D7FF3E'], array['birthday','badge']),

    ('couples', 'Together Since', 'detailed_artwork', 'front',
      $$
      {"version":"7.4.0","objects":[
        {"id":"f1","type":"Circle","left":285,"top":270,"originX":"center","originY":"center","radius":22,"fill":"#D7FF3E"},
        {"id":"f2","type":"Circle","left":315,"top":270,"originX":"center","originY":"center","radius":22,"fill":"#D7FF3E"},
        {"id":"f3","type":"Rect","left":300,"top":295,"originX":"center","originY":"center","width":34,"height":34,"angle":45,"fill":"#D7FF3E"},
        {"id":"f4","type":"IText","left":300,"top":360,"originX":"center","originY":"center","fontSize":20,"fontFamily":"Archivo, sans-serif","fontWeight":600,"fill":"#0B0B0C","text":"TOGETHER SINCE 2024","textAlign":"center"}
      ]}
      $$,
      array['#F4F2EC','#A8A69F'], array['couples','matching']),

    ('graduation', 'Class Of', 'oversized_front_print', 'front',
      $$
      {"version":"7.4.0","objects":[
        {"id":"g1","type":"IText","left":300,"top":300,"originX":"center","originY":"center","fontSize":64,"fontFamily":"Anton, sans-serif","fontWeight":400,"fill":"#0B0B0C","text":"CLASS OF\n2026","textAlign":"center"}
      ]}
      $$,
      array['#F4F2EC','#D7FF3E'], array['graduation','oversized']),

    ('football', 'Jersey Back', 'large_back_print', 'back',
      $$
      {"version":"7.4.0","objects":[
        {"id":"h1","type":"IText","left":300,"top":200,"originX":"center","originY":"center","fontSize":32,"fontFamily":"Archivo, sans-serif","fontWeight":700,"fill":"#0B0B0C","text":"LAST NAME","textAlign":"center"},
        {"id":"h2","type":"IText","left":300,"top":340,"originX":"center","originY":"center","fontSize":120,"fontFamily":"Anton, sans-serif","fontWeight":400,"fill":"#0B0B0C","text":"23","textAlign":"center"}
      ]}
      $$,
      array['#F4F2EC','#A8A69F'], array['football','jersey','sports']),

    ('business', 'Company Wordmark', 'front_and_back', 'front_and_back',
      $$
      {"version":"7.4.0","objects":[
        {"id":"i1","type":"IText","left":300,"top":300,"originX":"center","originY":"center","fontSize":28,"fontFamily":"Archivo, sans-serif","fontWeight":700,"fill":"#0B0B0C","text":"NORTHFIELD & CO","textAlign":"center"}
      ]}
      $$,
      array['#F4F2EC','#A8A69F','#0B0B0C'], array['business','wordmark','logo']),

    ('events', 'Summer Fest', 'full_color_illustration', 'front',
      $$
      {"version":"7.4.0","objects":[
        {"id":"j1","type":"Circle","left":250,"top":260,"originX":"center","originY":"center","radius":20,"fill":"#D7FF3E"},
        {"id":"j2","type":"Triangle","left":300,"top":250,"originX":"center","originY":"center","width":36,"height":36,"fill":"#F4F2EC"},
        {"id":"j3","type":"Circle","left":350,"top":260,"originX":"center","originY":"center","radius":20,"fill":"#A8A69F"},
        {"id":"j4","type":"IText","left":300,"top":340,"originX":"center","originY":"center","fontSize":26,"fontFamily":"Anton, sans-serif","fontWeight":400,"fill":"#0B0B0C","text":"SUMMER FEST","textAlign":"center"}
      ]}
      $$,
      array['#0B0B0C'], array['events','festival','illustration'])
) as t(category_slug, name, design_type, print_area, canvas_json, colors, tags)
  on tc.slug = t.category_slug
where not exists (
  select 1 from public.design_templates dt
  where dt.category_id = tc.id and dt.name = t.name
);

-- Business template also gets a back side.
update public.design_templates
set back_canvas_json = $$
  {"version":"7.4.0","objects":[
    {"id":"i2","type":"IText","left":300,"top":300,"originX":"center","originY":"center","fontSize":18,"fontFamily":"Archivo, sans-serif","fontWeight":500,"fill":"#0B0B0C","text":"Est. 2019, built to last","textAlign":"center"}
  ]}
$$::jsonb
where name = 'Company Wordmark' and back_canvas_json is null;
