-- Phase 7: a small curated Anime template category. Data only -- no schema
-- change, following exactly the same pattern as the Phase 3 starter-
-- template migration (design_templates/template_categories already support
-- everything these need). Every object below is a real, native Fabric
-- object (Path/Line/Circle/Rect/IText) round-trippable through the exact
-- same canvas.toObject()/loadFromJSON() the live editor already uses --
-- nothing here is a flattened image. Path geometry is this migration's own
-- original composition (the crescent moon and visor-eye shapes are drawn
-- from this repo's own new Phase 7 artwork library --
-- public/assets/designs/graphic-art/katana-crescent.svg and
-- visor-grid.svg -- re-expressed as Fabric Path data, not copied from any
-- external reference). Light ink (#F4F2EC) on black, matching this
-- category's real garment (see garmentColors.ts's "anime" entry) --
-- calibrated for a dark shirt, distinct from the standalone artwork
-- library pieces, which stay dark-ink for legibility in the light-
-- background browsing UI.
--
-- Every object's canvas_json was verified before this migration was
-- written by loading it through real fabric.js 7.4.0 (loadFromJSON) in an
-- isolated browser check and confirming every object lands within the
-- 600x600 canvas with a real, non-zero size -- not just hand-checked
-- arithmetic.

insert into public.template_categories (slug, name, sort_order)
values
  ('anime', 'Anime', 18)
on conflict (slug) do nothing;

insert into public.design_templates (category_id, name, design_type, print_area, canvas_json, back_canvas_json, colors, tags)
select tc.id, t.name, t.design_type, t.print_area::public.template_print_area, t.canvas_json::jsonb, t.back_canvas_json::jsonb, t.colors, t.tags
from public.template_categories tc
join (
  values
    -- 1. Ronin -- a crescent moon (from katana-crescent.svg) and a single
    -- diagonal blade stroke, stacked bold type below.
    ('anime', 'Ronin', 'large_front_graphic', 'front',
      $$
      {"version":"7.4.0","objects":[
        {"type":"Path","path":"M 260,90 C 300,100 322,138 314,176 C 306,140 278,116 246,112 C 250,102 254,95 260,90 Z","fill":"#F4F2EC","left":460,"top":140,"originX":"center","originY":"center","scaleX":1.4,"scaleY":1.4},
        {"type":"Line","x1":140,"y1":470,"x2":420,"y2":190,"stroke":"#F4F2EC","strokeWidth":12,"strokeLineCap":"round"},
        {"type":"Circle","radius":10,"fill":"transparent","stroke":"#F4F2EC","strokeWidth":5,"left":128,"top":478,"originX":"center","originY":"center"},
        {"type":"IText","text":"RONIN","left":300,"top":530,"originX":"center","originY":"center","fontSize":64,"fontFamily":"Anton, sans-serif","fill":"#F4F2EC","textAlign":"center"},
        {"type":"IText","text":"NO MASTER · NO FEAR","left":300,"top":576,"originX":"center","originY":"center","fontSize":13,"fontFamily":"Archivo, sans-serif","fontWeight":600,"fill":"#F4F2EC","charSpacing":150,"textAlign":"center"}
      ]}
      $$,
      null,
      array['#0B0B0C'], array['anime','samurai','bold']),

    -- 2. Tokyo After Dark -- speed-line accents framing a stacked anime
    -- title-card style wordmark. The whole point of this one is the type
    -- itself, matching the Phase 3 "Typography" template's own reasoning.
    ('anime', 'Tokyo After Dark', 'simple_text', 'front',
      $$
      {"version":"7.4.0","objects":[
        {"type":"Line","x1":30,"y1":260,"x2":170,"y2":235,"stroke":"#F4F2EC","strokeWidth":6,"strokeLineCap":"round"},
        {"type":"Line","x1":570,"y1":340,"x2":430,"y2":365,"stroke":"#F4F2EC","strokeWidth":6,"strokeLineCap":"round"},
        {"type":"IText","text":"TOKYO","left":300,"top":280,"originX":"center","originY":"center","fontSize":110,"fontFamily":"Anton, sans-serif","fill":"#F4F2EC","textAlign":"center"},
        {"type":"IText","text":"AFTER DARK","left":300,"top":350,"originX":"center","originY":"center","fontSize":34,"fontWeight":700,"fontFamily":"Archivo, sans-serif","fill":"#F4F2EC","charSpacing":150,"textAlign":"center"},
        {"type":"Rect","width":240,"height":4,"fill":"#F4F2EC","left":300,"top":375,"originX":"center","originY":"center"}
      ]}
      $$,
      null,
      array['#0B0B0C'], array['anime','anime-streetwear','typography']),

    -- 3. Neon Spirit -- the visor-eye mark (from visor-grid.svg, expressed
    -- as a real evenodd-hole Path so the shirt color shows through the
    -- "lens" exactly like the standalone artwork piece) over bold type.
    ('anime', 'Neon Spirit', 'large_front_graphic', 'front',
      $$
      {"version":"7.4.0","objects":[
        {"type":"Path","path":"M 60,190 C 100,150 160,132 200,132 C 240,132 300,150 340,190 C 300,222 240,240 200,240 C 160,240 100,222 60,190 Z M 96,190 C 126,166 164,154 200,154 C 236,154 274,166 304,190 C 274,210 236,220 200,220 C 164,220 126,210 96,190 Z","fill":"#F4F2EC","fillRule":"evenodd","left":300,"top":230,"originX":"center","originY":"center"},
        {"type":"Rect","width":208,"height":8,"fill":"#F4F2EC","left":300,"top":226,"originX":"center","originY":"center"},
        {"type":"IText","text":"NEON SPIRIT","left":300,"top":420,"originX":"center","originY":"center","fontSize":52,"fontFamily":"Anton, sans-serif","fill":"#F4F2EC","textAlign":"center"},
        {"type":"IText","text":"SIGNAL LOST IN THE CITY","left":300,"top":466,"originX":"center","originY":"center","fontSize":13,"fontFamily":"Archivo, sans-serif","fontWeight":600,"fill":"#F4F2EC","charSpacing":100,"textAlign":"center"}
      ]}
      $$,
      null,
      array['#0B0B0C'], array['anime','cyberpunk-anime','bold'])
) as t(category_slug, name, design_type, print_area, canvas_json, back_canvas_json, colors, tags)
on tc.slug = t.category_slug;
