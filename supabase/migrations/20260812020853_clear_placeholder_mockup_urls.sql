-- The seeded product_colors rows had front_mockup_url/back_mockup_url
-- pointing at picsum.photos placeholder photos (random stock imagery,
-- not T-shirts). The app now renders a color-tinted SVG mockup
-- (TShirtMockup) from `hex` directly instead of an image URL, so these
-- columns are cleared rather than left populated with incorrect data.
-- The columns themselves stay (a future photographic mockup pipeline
-- can populate them again).

UPDATE public.product_colors SET front_mockup_url = NULL, back_mockup_url = NULL;
