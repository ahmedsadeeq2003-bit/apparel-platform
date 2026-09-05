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
