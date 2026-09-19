/**
 * Phase 3 (Garment Catalog): the catalog of garment *types* STITCH intends
 * to offer, independent of which ones are real orderable products today.
 *
 * This is deliberately NOT the same thing as `getActiveProducts()`
 * (products/queries.ts) -- that reads real rows from the `products` table
 * (RLS-public-read-active), and only `classic-tee` has one, because it's
 * the only garment with real photographed colors (see `shirtAssets` in
 * lib/assets/manifest.ts) and real print/design-area geometry verified
 * against those photos (see garmentPhoto.ts).
 *
 * Oversized Tee, Hoodie, and Sweatshirt are NOT given a `products` row,
 * fabricated colors, or invented image paths here. Inserting DB rows for
 * them would make `/products` and Design Hub present them as real,
 * orderable garments backed by nothing -- exactly what this phase's brief
 * explicitly forbids ("do NOT fabricate image paths to files that don't
 * exist... mark the garment/color appropriately as needing a real asset").
 * Instead this file is a small, static, non-DB catalog the UI can use to
 * show them honestly as upcoming, disabled entries -- see
 * GarmentCatalogSection.tsx, the one place that reads this.
 *
 * The moment real photography exists for one of these three: shoot it,
 * drop the files under public/assets/shirts/<slug>/, add the real
 * `shirtAssets.<slug>` entries in manifest.ts (the empty `{}` records are
 * already there, see manifest.ts's own comment), verify + add its
 * `designAreaPct`/`printAreaPct` to GARMENT_GEOMETRY_BY_SLUG in
 * garmentPhoto.ts (the same way classic-tee's was verified against its own
 * photos), seed the real `products`/`product_colors` rows, and flip
 * `available` to `true` below. No other architecture changes needed --
 * the shared editor, DesignCanvas, and useDesignEditor.ts already resolve
 * geometry/photo per product slug generically.
 */

export type GarmentType = "t-shirt" | "hoodie" | "sweatshirt";

export type GarmentCatalogEntry = {
  /** Matches `products.slug` once (if) this garment becomes a real product
   * -- kept identical to PRODUCT_SLUG_TO_MANIFEST_KEY's keys in
   * garmentPhoto.ts so the two never drift out of sync under different
   * naming. */
  slug: string;
  type: GarmentType;
  name: string;
  description: string;
  /** True only for a garment with a real `products` row, real photographed
   * colors, and verified design/print-area geometry. Every other entry
   * here is a real product STITCH intends to offer, shown as "coming soon"
   * rather than hidden -- honest about the roadmap without claiming it's
   * orderable yet. */
  available: boolean;
};

export const GARMENT_CATALOG: GarmentCatalogEntry[] = [
  {
    slug: "classic-tee",
    type: "t-shirt",
    name: "Classic Tee",
    description: "A true-to-size everyday tee -- the reference garment for STITCH's whole design experience.",
    available: true,
  },
  {
    slug: "oversized-tee",
    type: "t-shirt",
    name: "Oversized Tee",
    description: "A relaxed, dropped-shoulder fit for bigger back prints and streetwear silhouettes.",
    available: false,
  },
  {
    slug: "hoodie",
    type: "hoodie",
    name: "Hoodie",
    description: "Heavyweight fleece with room for a front chest mark and a full-back print.",
    available: false,
  },
  {
    slug: "sweatshirt",
    type: "sweatshirt",
    name: "Sweatshirt",
    description: "A clean crewneck base for minimal marks or an oversized graphic.",
    available: false,
  },
];

export function getAvailableGarments(): GarmentCatalogEntry[] {
  return GARMENT_CATALOG.filter((garment) => garment.available);
}

export function getComingSoonGarments(): GarmentCatalogEntry[] {
  return GARMENT_CATALOG.filter((garment) => !garment.available);
}
