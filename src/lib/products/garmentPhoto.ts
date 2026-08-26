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
