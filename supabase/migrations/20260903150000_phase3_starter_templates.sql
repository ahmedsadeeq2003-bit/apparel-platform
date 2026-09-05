-- Phase 3: original starter template collection. Data only -- no schema
-- change (design_templates/template_categories already support everything
-- these need: multiple text/shape objects, per-object font/size/spacing/
-- fill/rotation, front+back placement via canvas_json/back_canvas_json).
-- Every object below is a real, native Fabric object (IText/Rect/Circle/
-- Path/Line) round-trippable through the exact same canvas.toObject()/
-- loadFromJSON() the live editor already uses -- nothing here is a
-- flattened image. Shape geometry for the transcribed pieces (crown, sun,
-- star, motion-lines) is read directly from this repo's own real SVG
-- library (public/assets/designs/**) and re-expressed as Fabric Path/Line
-- data at the same coordinates, not copied from any external reference --
-- these are STITCH's own existing assets, composed into new original
-- layouts inspired by common graphic-tee composition conventions (bold
-- stacked type, badge/vintage rings, poster-style graphics), not a
-- reproduction of any specific outside design.

-- New style-driven categories (existing 10 stay untouched; sort_order
-- continues from where they left off).
insert into public.template_categories (slug, name, sort_order)
values
  ('vintage', 'Vintage', 10),
  ('typography', 'Typography', 11),
  ('abstract', 'Abstract', 12),
  ('illustration', 'Illustration', 13),
  ('retro', 'Retro', 14),
  ('experimental', 'Experimental', 15),
  ('music', 'Music & Culture', 16),
  ('sport', 'Sport & Energy', 17)
on conflict (slug) do nothing;

insert into public.design_templates (category_id, name, design_type, print_area, canvas_json, back_canvas_json, colors, tags)
select tc.id, t.name, t.design_type, t.print_area::public.template_print_area, t.canvas_json::jsonb, t.back_canvas_json::jsonb, t.colors, t.tags
from public.template_categories tc
join (
  values
    -- 1. Streetwear -- a hand-drawn crown (real graffiti-library shape,
    -- re-expressed as two Paths + three Circles at their original
    -- coordinates) over stacked bold type. Light ink for the black garment
    -- this category already renders on.
    ('streetwear', 'Crowned', 'large_front_graphic', 'front',
      $$
      {"version":"7.4.0","objects":[
        {"type":"Path","path":"M 80,260 L 95,150 L 150,205 L 200,110 L 250,205 L 305,150 L 320,260 Z","fill":"transparent","stroke":"#F4F2EC","strokeWidth":20,"strokeLineJoin":"round","strokeLineCap":"round","left":249.6,"top":142.2,"scaleX":0.42,"scaleY":0.42},
        {"type":"Path","path":"M 80,260 L 320,260 L 316,285 L 84,285 Z","fill":"#F4F2EC","left":249.6,"top":205.2,"scaleX":0.42,"scaleY":0.42},
        {"type":"Circle","radius":12,"fill":"#F4F2EC","left":250.86,"top":153.96,"scaleX":0.42,"scaleY":0.42},
        {"type":"Circle","radius":14,"fill":"#F4F2EC","left":294.12,"top":136.32,"scaleX":0.42,"scaleY":0.42},
        {"type":"Circle","radius":12,"fill":"#F4F2EC","left":339.06,"top":153.96,"scaleX":0.42,"scaleY":0.42},
        {"type":"IText","text":"CROWNED","left":300,"top":340,"originX":"center","originY":"center","fontSize":58,"fontFamily":"Anton, sans-serif","fontWeight":400,"fill":"#F4F2EC","textAlign":"center"},
        {"type":"IText","text":"SELF MADE","left":300,"top":390,"originX":"center","originY":"center","fontSize":15,"fontFamily":"Archivo, sans-serif","fontWeight":600,"fill":"#F4F2EC","charSpacing":350,"textAlign":"center"}
      ]}
      $$,
      null,
      array['#0B0B0C'], array['streetwear','crown','bold','graffiti']),

    -- 2. Minimal -- mixed-weight editorial type, one thin rule. Dark ink,
    -- this category's existing cream/white garment.
    ('minimal', 'Quiet Confidence', 'simple_text', 'front',
      $$
      {"version":"7.4.0","objects":[
        {"type":"IText","text":"quiet","left":300,"top":270,"originX":"center","originY":"center","fontSize":30,"fontStyle":"italic","fontFamily":"Playfair Display, serif","fill":"#0B0B0C","textAlign":"center"},
        {"type":"IText","text":"CONFIDENCE","left":300,"top":315,"originX":"center","originY":"center","fontSize":42,"fontWeight":700,"fontFamily":"Archivo, sans-serif","fill":"#0B0B0C","charSpacing":40,"textAlign":"center"},
        {"type":"Line","x1":250,"y1":360,"x2":350,"y2":360,"stroke":"#0B0B0C","strokeWidth":2,"left":250,"top":359}
      ]}
      $$,
      null,
      array['#F4F2EC'], array['minimal','editorial','typography']),

    -- 3. Vintage -- a badge/ring composition, the classic "established"
    -- tee convention. Dark ink on white.
    ('vintage', 'Established Goods', 'detailed_artwork', 'front',
      $$
      {"version":"7.4.0","objects":[
        {"type":"Circle","radius":110,"fill":"transparent","stroke":"#0B0B0C","strokeWidth":3,"left":190,"top":150},
        {"type":"Circle","radius":92,"fill":"transparent","stroke":"#0B0B0C","strokeWidth":1.5,"left":208,"top":168},
        {"type":"IText","text":"EST.","left":300,"top":205,"originX":"center","originY":"center","fontSize":20,"fontFamily":"Playfair Display, serif","fill":"#0B0B0C","charSpacing":200,"textAlign":"center"},
        {"type":"IText","text":"2024","left":300,"top":250,"originX":"center","originY":"center","fontSize":48,"fontFamily":"Anton, sans-serif","fill":"#0B0B0C","textAlign":"center"},
        {"type":"IText","text":"ORIGINAL GOODS","left":300,"top":310,"originX":"center","originY":"center","fontSize":13,"fontFamily":"Archivo, sans-serif","fill":"#0B0B0C","charSpacing":250,"textAlign":"center"}
      ]}
      $$,
      null,
      array['#EDEADF'], array['vintage','badge','ring']),

    -- 4. Typography -- large stacked bold statement type, tilted for
    -- energy. The whole point of this category is the type itself, no
    -- artwork needed.
    ('typography', 'Make Noise', 'simple_text', 'front',
      $$
      {"version":"7.4.0","objects":[
        {"type":"IText","text":"MAKE","left":300,"top":250,"originX":"center","originY":"center","fontSize":68,"angle":-3,"fontFamily":"Anton, sans-serif","fill":"#F4F2EC","textAlign":"center"},
        {"type":"IText","text":"NOISE","left":300,"top":335,"originX":"center","originY":"center","fontSize":88,"angle":-3,"fontFamily":"Anton, sans-serif","fill":"#F4F2EC","textAlign":"center"}
      ]}
      $$,
      null,
      array['#0B0B0C'], array['typography','bold','statement']),

    -- 5. Abstract -- real kinetic-motion lines (abstract-library shape) at
    -- their original relative angles, with a small caption.
    ('abstract', 'In Motion', 'large_front_graphic', 'front',
      $$
      {"version":"7.4.0","objects":[
        {"type":"Line","x1":60,"y1":330,"x2":150,"y2":70,"stroke":"#0B0B0C","strokeWidth":9,"strokeLineCap":"round","left":251,"top":174.5,"scaleX":0.35,"scaleY":0.35},
        {"type":"Line","x1":110,"y1":335,"x2":200,"y2":75,"stroke":"#0B0B0C","strokeWidth":9,"strokeLineCap":"round","left":268.5,"top":176.25,"scaleX":0.35,"scaleY":0.35},
        {"type":"Line","x1":160,"y1":338,"x2":250,"y2":78,"stroke":"#0B0B0C","strokeWidth":9,"strokeLineCap":"round","left":286,"top":177.3,"scaleX":0.35,"scaleY":0.35},
        {"type":"Line","x1":210,"y1":335,"x2":300,"y2":75,"stroke":"#0B0B0C","strokeWidth":9,"strokeLineCap":"round","opacity":0.55,"left":303.5,"top":176.25,"scaleX":0.35,"scaleY":0.35},
        {"type":"Line","x1":260,"y1":330,"x2":345,"y2":90,"stroke":"#0B0B0C","strokeWidth":9,"strokeLineCap":"round","opacity":0.3,"left":321,"top":181.5,"scaleX":0.35,"scaleY":0.35},
        {"type":"IText","text":"IN MOTION","left":300,"top":280,"originX":"center","originY":"center","fontSize":26,"fontWeight":700,"fontFamily":"Archivo, sans-serif","fill":"#0B0B0C","charSpacing":150,"textAlign":"center"}
      ]}
      $$,
      null,
      array['#9C9A93'], array['abstract','motion','minimal']),

    -- 6. Illustration -- a six-petal botanical mark (same construction
    -- technique as the editor's own hand-authored flower element, so it
    -- stays a genuinely recolorable single-tone graphic) with a
    -- handwritten caption.
    ('illustration', 'Wildflower', 'full_color_illustration', 'front',
      $$
      {"version":"7.4.0","objects":[
        {"type":"Circle","radius":13,"fill":"#8B9574","left":292,"top":188.8,"scaleX":2.4,"scaleY":2.4},
        {"type":"Circle","radius":13,"fill":"#8B9574","left":262.24,"top":229.84,"scaleX":2.4,"scaleY":2.4},
        {"type":"Circle","radius":13,"fill":"#8B9574","left":213.76,"top":214.24,"scaleX":2.4,"scaleY":2.4},
        {"type":"Circle","radius":13,"fill":"#8B9574","left":213.76,"top":163.36,"scaleX":2.4,"scaleY":2.4},
        {"type":"Circle","radius":13,"fill":"#8B9574","left":262.24,"top":147.76,"scaleX":2.4,"scaleY":2.4},
        {"type":"Circle","radius":9,"fill":"#8B9574","left":258.4,"top":198.4,"scaleX":2.4,"scaleY":2.4},
        {"type":"IText","text":"WILDFLOWER","left":280,"top":345,"originX":"center","originY":"center","fontSize":46,"fontFamily":"Caveat, cursive","fill":"#0B0B0C","textAlign":"center"}
      ]}
      $$,
      null,
      array['#F4F2EC'], array['illustration','botanical','handwritten']),

    -- 7. Retro -- a real sunburst (graphic-art library shape) with a
    -- tracked-out caption, the classic "endless summer" tee convention.
    ('retro', 'Endless Summer', 'large_front_graphic', 'front',
      $$
      {"version":"7.4.0","objects":[
        {"type":"Circle","radius":95,"fill":"#E2622B","stroke":"#F4F2EC","strokeWidth":6,"left":262,"top":174,"scaleX":0.4,"scaleY":0.4},
        {"type":"Rect","width":190,"height":14,"fill":"#F2EDE4","left":262,"top":200,"scaleX":0.4,"scaleY":0.4},
        {"type":"Rect","width":176,"height":14,"fill":"#F2EDE4","left":264.8,"top":211.2,"scaleX":0.4,"scaleY":0.4},
        {"type":"Rect","width":160,"height":14,"fill":"#F2EDE4","left":268,"top":222.4,"scaleX":0.4,"scaleY":0.4},
        {"type":"Rect","width":136,"height":14,"fill":"#F2EDE4","left":272.8,"top":233.6,"scaleX":0.4,"scaleY":0.4},
        {"type":"IText","text":"ENDLESS SUMMER","left":300,"top":340,"originX":"center","originY":"center","fontSize":34,"fontFamily":"Bebas Neue, sans-serif","fill":"#F4F2EC","charSpacing":80,"textAlign":"center"}
      ]}
      $$,
      null,
      array['#1A1816'], array['retro','sunburst','summer']),

    -- 8. Experimental -- a real spray-paint star (graffiti-library shape)
    -- with off-kilter, independently rotated type, deliberately
    -- asymmetric.
    ('experimental', 'Static', 'oversized_front_print', 'front',
      $$
      {"version":"7.4.0","objects":[
        {"type":"Path","path":"M 200,60 L 232,168 L 340,168 L 253,232 L 286,338 L 200,272 L 114,338 L 147,232 L 60,168 L 168,168 Z","fill":"#0B0B0C","stroke":"#0B0B0C","strokeWidth":6,"strokeLineJoin":"round","left":246.8,"top":126.8,"scaleX":0.38,"scaleY":0.38},
        {"type":"Circle","radius":6,"fill":"#0B0B0C","opacity":0.8,"left":347.12,"top":135.92,"scaleX":0.38,"scaleY":0.38},
        {"type":"Circle","radius":4,"fill":"#C1623A","left":245.28,"top":132.88,"scaleX":0.38,"scaleY":0.38},
        {"type":"IText","text":"STATIC","left":290,"top":340,"originX":"center","originY":"center","fontSize":60,"angle":4,"fontFamily":"Anton, sans-serif","fill":"#0B0B0C","textAlign":"center"},
        {"type":"IText","text":"NO SIGNAL","left":310,"top":390,"originX":"center","originY":"center","fontSize":14,"angle":-2,"fontFamily":"Archivo, sans-serif","fill":"#0B0B0C","charSpacing":300,"textAlign":"center"}
      ]}
      $$,
      null,
      array['#D7FF3E'], array['experimental','graffiti','asymmetric']),

    -- 9. Music & Culture -- an equalizer front print, front_and_back to
    -- genuinely exercise both sides: a small wordmark tag on the back.
    ('music', 'Turn It Up', 'front_and_back', 'front_and_back',
      $$
      {"version":"7.4.0","objects":[
        {"type":"IText","text":"TURN IT UP","left":300,"top":180,"originX":"center","originY":"center","fontSize":46,"fontFamily":"Anton, sans-serif","fill":"#F4F2EC","textAlign":"center"},
        {"type":"Rect","width":24,"height":80,"fill":"#F4F2EC","left":230,"top":280},
        {"type":"Rect","width":24,"height":120,"fill":"#F4F2EC","left":262,"top":240},
        {"type":"Rect","width":24,"height":160,"fill":"#F4F2EC","left":294,"top":200},
        {"type":"Rect","width":24,"height":110,"fill":"#F4F2EC","left":326,"top":250},
        {"type":"Rect","width":24,"height":90,"fill":"#F4F2EC","left":358,"top":270}
      ]}
      $$,
      $$
      {"version":"7.4.0","objects":[
        {"type":"IText","text":"STITCH SOUND SYSTEM","left":300,"top":300,"originX":"center","originY":"center","fontSize":16,"fontFamily":"Archivo, sans-serif","fill":"#F4F2EC","charSpacing":200,"textAlign":"center"}
      ]}
      $$,
      array['#0B0B0C'], array['music','culture','front-and-back']),

    -- 10. Sport & Energy -- a bolt (the editor's own existing lightning-
    -- bolt shape, at its original coordinates) with tilted, dynamic type.
    ('sport', 'Full Send', 'large_front_graphic', 'front',
      $$
      {"version":"7.4.0","objects":[
        {"type":"Path","path":"M60,0 L20,55 L45,55 L30,100 L85,40 L55,40 Z","fill":"#0B0B0C","left":172,"top":180,"scaleX":1.6,"scaleY":1.6},
        {"type":"IText","text":"FULL SEND","left":340,"top":380,"originX":"center","originY":"center","fontSize":54,"angle":-4,"fontFamily":"Anton, sans-serif","fill":"#0B0B0C","textAlign":"center"},
        {"type":"IText","text":"NO LIMITS","left":340,"top":430,"originX":"center","originY":"center","fontSize":15,"fontWeight":700,"angle":-4,"fontFamily":"Archivo, sans-serif","fill":"#0B0B0C","charSpacing":200,"textAlign":"center"}
      ]}
      $$,
      null,
      array['#D7FF3E'], array['sport','energy','dynamic'])
) as t(category_slug, name, design_type, print_area, canvas_json, back_canvas_json, colors, tags)
on tc.slug = t.category_slug;
