import { shirtAssets, type AssetEntry, type ShirtSide } from "@/lib/assets/manifest";

/**
 * Bridges the DB's product/color naming (`products.slug`, e.g. "classic-tee";
 * `product_colors.name`, e.g. "Ash Grey") to the real photographed garment
 * registered in `shirtAssets`. The manifest's own keys are camelCase derived
 * from those exact DB names (see manifest.ts's own comment) -- deriving the
 * key here rather than hand-maintaining a duplicate lookup map means a new
 * color added to the DB resolves automatically as long as its manifest entry
 * follows the same convention.
 */
function toCamelKey(name: string): string {
  const [first, ...rest] = name.trim().split(/\s+/);
  return (
    first.toLowerCase() +
    rest.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join("")
  );
}

const PRODUCT_SLUG_TO_MANIFEST_KEY: Record<string, keyof typeof shirtAssets> = {
  "classic-tee": "classicTee",
  "oversized-tee": "oversizedTee",
  hoodie: "hoodie",
  sweatshirt: "sweatshirt",
};

/** Real photo dimensions shared by every garment shoot in `shirtAssets` --
 * one place instead of the same literal copied into each component that
 * renders one. */
export const GARMENT_PHOTO_ASPECT = { width: 784, height: 1168 } as const;

/**
 * The print-safe region on a classic-tee garment photo, as a percentage of
 * the full photo -- where a design overlay (a finished composite, or a live
 * Fabric canvas) should sit so it lines up with the chest area of the real
 * garment. Verified directly against the photographed JPGs themselves
 * (classic-tee-black-front, classic-tee-black-back, classic-tee-white-front):
 * collar seam, shoulder span, and hem all land at consistent relative
 * positions across colors and both sides, so this single box is reused for
 * every color and for both `front` and `back` rather than defining separate
 * bounds per side/color.
 *
 * This is the same box `CampaignGarment.tsx` uses (as its own
 * `PHOTO_OVERLAY_PCT`, defined separately there rather than importing this
 * constant, to avoid a circular import -- CampaignGarment already imports
 * `CANVAS_SIZE` from `lib/editor/constants`, which imports this file). Keep
 * both values in sync if this ever changes.
 */
export const GARMENT_PRINT_AREA_PCT = { left: 21, top: 17, width: 58, height: 44 } as const;

/**
 * Positions a *second*, full copy of the same garment photo so that,
 * viewed only through the small print-area window (`overflow: hidden` at
 * `GARMENT_PRINT_AREA_PCT`), it lines up pixel-for-pixel with the same
 * region of the full photo sitting underneath -- the geometry for the
 * "printed on fabric" treatment (see GarmentTextureOverlay.tsx): a real,
 * low-opacity multiply-blended crop of the actual photograph's own fabric
 * texture/folds/shadow, not a synthetic filter.
 *
 * Derived algebraically from GARMENT_PRINT_AREA_PCT rather than a second
 * hand-eyeballed constant -- if `left/top` is where the print window
 * starts within the full photo, and the window is `width/height`
 * percent of the photo, then a full-size copy of the photo placed *inside*
 * that window (whose own CSS percentage basis is the window's size, not
 * the outer photo's) needs to be scaled up by `100/width` and shifted left
 * by `left/width` (as fractions) to bring the same crop back into view --
 * verified by hand: window-start (left% of photo) minus the window's own
 * origin (also left% of photo, since window and overlay share the same
 * left edge) always cancels to 0, i.e. the overlay's visible crop starts
 * exactly where the base photo's own left% does.
 */
export const GARMENT_TEXTURE_OVERLAY_PCT = {
  left: -(GARMENT_PRINT_AREA_PCT.left / GARMENT_PRINT_AREA_PCT.width) * 100,
  top: -(GARMENT_PRINT_AREA_PCT.top / GARMENT_PRINT_AREA_PCT.height) * 100,
  width: (100 / GARMENT_PRINT_AREA_PCT.width) * 100,
  height: (100 / GARMENT_PRINT_AREA_PCT.height) * 100,
} as const;

/**
 * Phase 8: the live editor's actual design surface -- a much larger box
 * than `GARMENT_PRINT_AREA_PCT`, spanning most of the visible torso panel
 * (verified by eye against the real classic-tee-black-front.jpg: stays
 * clear of the collar/neck, the sleeve seams left/right, and the hem at
 * the bottom). `GARMENT_PRINT_AREA_PCT` itself is deliberately left
 * untouched -- it's still the real "print-safe" reference (now shown as a
 * guide *inside* this bigger area, see PRINT_SAFE_AREA_BOUNDS in
 * lib/editor/constants.ts) and it's still what CampaignGarment's static
 * template/artwork previews use, which this phase does not touch. */
export const GARMENT_DESIGN_AREA_PCT = { left: 15, top: 16, width: 70, height: 66 } as const;

/** Same texture-alignment derivation as GARMENT_TEXTURE_OVERLAY_PCT above,
 * just relative to the bigger GARMENT_DESIGN_AREA_PCT box instead of the
 * print-safe one -- GarmentTextureOverlay takes this as an explicit prop
 * now (see its own comment) rather than assuming one fixed box, since the
 * live editor and CampaignGarment's static previews are no longer the
 * same size. */
export const GARMENT_DESIGN_TEXTURE_OVERLAY_PCT = {
  left: -(GARMENT_DESIGN_AREA_PCT.left / GARMENT_DESIGN_AREA_PCT.width) * 100,
  top: -(GARMENT_DESIGN_AREA_PCT.top / GARMENT_DESIGN_AREA_PCT.height) * 100,
  width: (100 / GARMENT_DESIGN_AREA_PCT.width) * 100,
  height: (100 / GARMENT_DESIGN_AREA_PCT.height) * 100,
} as const;

export type GarmentGeometryPct = { left: number; top: number; width: number; height: number };

/**
 * Phase 3 (Garment Catalog): design-area/print-safe geometry, keyed by
 * `products.slug` -- each garment type has its own proportions (a hoodie's
 * body/pocket/hood silhouette isn't the same shape as a tee), so the single
 * classic-tee-shaped GARMENT_DESIGN_AREA_PCT/GARMENT_PRINT_AREA_PCT pair
 * above can no longer be the *only* geometry the editor knows about.
 *
 * Only `classic-tee` has a real entry -- it's the one garment with real
 * photographed colors (see shirtAssets in manifest.ts) and the exact
 * numbers already verified against those photos (see both constants'
 * own comments). Oversized Tee/Hoodie/Sweatshirt are NOT given invented
 * geometry here: there is no real garment photo to verify a design/print
 * area against yet (see src/lib/products/garments.ts's own comment on why
 * those three stay `available: false` and out of the `products` table
 * rather than being seeded with fabricated colors/photos). Their geometry
 * simply doesn't exist here until a real photo does; getGarmentGeometryPct
 * falls back to classic-tee's numbers for any slug with no entry, which is
 * dead code today (no other product resolves in getProductBySlug) and
 * exists only so the editor never crashes on an unrecognized slug -- not a
 * claim that those numbers are correct for a not-yet-photographed garment.
 */
const GARMENT_GEOMETRY_BY_SLUG: Record<string, { designAreaPct: GarmentGeometryPct; printAreaPct: GarmentGeometryPct }> = {
  "classic-tee": { designAreaPct: GARMENT_DESIGN_AREA_PCT, printAreaPct: GARMENT_PRINT_AREA_PCT },
};

/** The design-area/print-safe geometry for one product slug -- what
 * DesignCanvas.tsx and lib/editor/constants.ts's per-product helpers
 * actually consume, so the editor reads geometry from garment
 * configuration (Phase 3A) instead of importing one fixed pair of
 * constants. */
export function getGarmentGeometryPct(productSlug: string): { designAreaPct: GarmentGeometryPct; printAreaPct: GarmentGeometryPct } {
  return GARMENT_GEOMETRY_BY_SLUG[productSlug] ?? GARMENT_GEOMETRY_BY_SLUG["classic-tee"];
}

/** Same texture-alignment derivation as GARMENT_TEXTURE_OVERLAY_PCT/
 * GARMENT_DESIGN_TEXTURE_OVERLAY_PCT above, generalized to any product
 * slug's own design-area box (see getGarmentGeometryPct) instead of always
 * classic-tee's. DesignCanvas.tsx uses this (not the two fixed constants
 * above) so a future garment with its own real photo and design-area
 * geometry gets a correctly-aligned fabric-texture overlay automatically,
 * with no per-garment component code. */
export function getGarmentDesignTextureOverlayPct(productSlug: string): GarmentGeometryPct {
  const { designAreaPct } = getGarmentGeometryPct(productSlug);
  return {
    left: -(designAreaPct.left / designAreaPct.width) * 100,
    top: -(designAreaPct.top / designAreaPct.height) * 100,
    width: (100 / designAreaPct.width) * 100,
    height: (100 / designAreaPct.height) * 100,
  };
}

/**
 * The real photographed garment for a DB product slug + color name + side,
 * or `null` if no real photo exists for that combination yet. Callers must
 * treat `null` as "don't render an image here" -- never fall back to a
 * placeholder, a generated image, or the old SVG mockup.
 */
export function getGarmentPhoto(productSlug: string, colorName: string, side: ShirtSide): AssetEntry | null {
  const productKey = PRODUCT_SLUG_TO_MANIFEST_KEY[productSlug];
  if (!productKey) return null;

  const colorsForProduct = shirtAssets[productKey] as Record<string, Record<ShirtSide, AssetEntry>>;
  const colorEntry = colorsForProduct[toCamelKey(colorName)];
  if (!colorEntry) return null;

  const photo = colorEntry[side];
  return photo.available ? photo : null;
}

/** Whether a real photo exists for this product/color/side -- e.g. to
 * decide whether a "Back" view toggle should even be offered. */
export function hasGarmentPhoto(productSlug: string, colorName: string, side: ShirtSide): boolean {
  return getGarmentPhoto(productSlug, colorName, side) !== null;
}
