/**
 * Central, typed registry for static assets served from `public/assets/`.
 * Nothing under `public/assets/` exists yet (see the asset-organization
 * report) -- every entry below is a *contract*: the exact path a file
 * should be dropped at, not a claim that the file is there. `available`
 * stays `false` until the real file lands; consumers should check it and
 * fall back to the existing honest SVG mockup system (TShirtMockup /
 * CampaignGarment) rather than rendering a broken <img>.
 *
 * Shirt colors mirror the real `product_colors` rows for the `classic-tee`
 * product (see supabase/seed.sql) rather than invented names -- if a color
 * is renamed/added in the database, update the matching entry here too;
 * this manifest is static and won't pick up DB changes automatically.
 */

export type AssetEntry = {
  path: string;
  available: boolean;
  /** Present for individually browsable assets (design/template library
   * entries); omitted for the shirt/gallery/decorative entries below that
   * don't need their own id/label. */
  id?: string;
  name?: string;
};

function pending(path: string): AssetEntry {
  return { path, available: false };
}

/** Title-cases a kebab-case filename ("hand-drawn-crown" -> "Hand Drawn
 * Crown") for display labels, so the 82 entries below don't need a manual
 * `name` typed out for each one. */
function titleCase(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function designEntry(category: DesignCategory, slug: string): AssetEntry {
  return {
    id: `${category}-${slug}`,
    name: titleCase(slug),
    path: `/assets/designs/${category}/${slug}.svg`,
    available: true,
  };
}

function templateEntry(category: TemplateCategory, slug: string): AssetEntry {
  return {
    id: `${category}-${slug}`,
    name: titleCase(slug),
    path: `/assets/templates/${category}/${slug}.json`,
    available: true,
  };
}

export type ShirtSide = "front" | "back";
export type ShirtColorAssets = Record<ShirtSide, AssetEntry>;

function shirtColor(styleSlug: string, colorSlug: string): ShirtColorAssets {
  return {
    front: pending(`/assets/shirts/${styleSlug}/front/${styleSlug}-${colorSlug}-front.png`),
    back: pending(`/assets/shirts/${styleSlug}/back/${styleSlug}-${colorSlug}-back.png`),
  };
}

export const shirtAssets = {
  /** Real product (`products.slug = "classic-tee"`); colors match the real
   * `product_colors` rows exactly. */
  classicTee: {
    white: shirtColor("classic-tee", "white"),
    // The one real photographed color so far -- landing-page hero only.
    // .jpg (not the shirtColor() helper's default .png) because that's the
    // real file's actual encoding.
    black: {
      front: { path: "/assets/shirts/classic-tee/front/classic-tee-black-front.jpg", available: true },
      back: { path: "/assets/shirts/classic-tee/back/classic-tee-black-back.jpg", available: true },
    },
    ashGrey: shirtColor("classic-tee", "ash-grey"),
    voltGreen: shirtColor("classic-tee", "volt-green"),
  },
  /** Not yet real products in the database (no `products` row, no colors).
   * Folder structure is prepared under public/assets/shirts/, but no
   * entries are declared here until the product + its actual colors exist
   * -- inventing color names for a product that doesn't exist yet would
   * misrepresent what's real. */
  oversizedTee: {} as Record<string, ShirtColorAssets>,
  hoodie: {} as Record<string, ShirtColorAssets>,
  sweatshirt: {} as Record<string, ShirtColorAssets>,
};

/** Standalone artwork (a print graphic on its own, not yet composed onto a
 * shirt) and complete starter templates, both grouped by design category.
 *
 * Populated from the externally generated "STITCH artwork library" package
 * (67 SVGs: 60 new + 7 pre-existing typography marks; 15 templates),
 * installed under `public/assets/{designs,templates}/<category>/`. The
 * package shipped its own `manifest.ts`, but per the integration
 * instructions that file is NOT authoritative -- it was authored without
 * access to this repository (different types/shape entirely: `DESIGN_ASSETS`
 * flat array, `AssetCategory` union, etc). This is a merge of its actual
 * *entries* into our existing `AssetEntry`/per-category-record shape, not a
 * replacement of this file. */
export type DesignCategory = "typography" | "graffiti" | "illustration" | "abstract" | "minimal" | "graphic-art";
export type TemplateCategory = "typography" | "illustration" | "graffiti" | "abstract" | "minimal";

export const designAssets: Record<DesignCategory, AssetEntry[]> = {
  typography: [
    "create-your-own",
    "good-energy",
    "made-by-you",
    "make-something",
    "no-signal",
    "off-the-clock",
    "stay-curious",
  ].map((slug) => designEntry("typography", slug)),
  graffiti: [
    "graffiti-face",
    "graffiti-tag-01",
    "graffiti-tag-02",
    "graffiti-tag-03",
    "hand-drawn-crown",
    "paint-drip",
    "scribble-burst",
    "spray-paint-arrow",
    "spray-paint-star",
    "street-flame",
    "street-lightning",
    "wildstyle-mark",
  ].map((slug) => designEntry("graffiti", slug)),
  illustration: [
    "abstract-face",
    "botanical-flower",
    "butterfly-line-art",
    "celestial-eye",
    "flying-bird",
    "hand-and-flower",
    "lucky-star",
    "matchstick",
    "snake-line-art",
    "sun-and-moon",
    "vintage-camera",
    "wild-flower",
  ].map((slug) => designEntry("illustration", slug)),
  abstract: [
    "abstract-loop",
    "abstract-sun",
    "asymmetric-shapes",
    "blob-composition",
    "distorted-circle",
    "distorted-grid",
    "experimental-form",
    "fluid-lines",
    "geometric-stack",
    "ink-splash",
    "kinetic-lines",
    "organic-wave",
  ].map((slug) => designEntry("abstract", slug)),
  minimal: [
    "abstract-arrow",
    "compass-symbol",
    "minimal-cross",
    "minimal-eye",
    "simple-heart",
    "simple-mountain",
    "small-lightning",
    "smile-symbol",
    "tiny-flower",
    "tiny-moon",
    "tiny-star",
    "tiny-sun",
  ].map((slug) => designEntry("minimal", slug)),
  "graphic-art": [
    "abstract-retro-symbol",
    "bold-smiley",
    "checker-wave",
    "cosmic-symbol",
    "distorted-smiley",
    "experimental-poster-mark",
    "lightning-bolt",
    "psychedelic-flower",
    "retro-dice",
    "retro-flower",
    "retro-sun",
    "vintage-starburst",
  ].map((slug) => designEntry("graphic-art", slug)),
};

export const templateAssets: Record<TemplateCategory, AssetEntry[]> = {
  typography: ["good-vibes-only", "off-duty", "own-it"].map((slug) => templateEntry("typography", slug)),
  graffiti: ["crowned", "street-signal", "wildstyle-riot"].map((slug) => templateEntry("graffiti", slug)),
  illustration: ["free-flight", "night-eye", "wild-bloom"].map((slug) => templateEntry("illustration", slug)),
  abstract: ["after-midnight", "kinetic-form", "quiet-flow"].map((slug) => templateEntry("abstract", slug)),
  minimal: ["less-is-more", "northbound", "quiet-energy"].map((slug) => templateEntry("minimal", slug)),
};

/** Real completed customer designs, shown with the customer's consent (see
 * the `designs` table / editor Phase 1 report -- there is no opt-in-gallery
 * or moderation flow built yet, so this stays empty until that exists). */
export const galleryAssets: AssetEntry[] = [];

/** Photography for the "How It Works" section (upload / design / print &
 * ship steps). Empty -- the current homepage uses an honest icon-based
 * illustration in place of photography here; see the homepage report. */
export const howItWorksAssets: AssetEntry[] = [];

export type DecorativeCategory = "graffiti" | "illustrations" | "textures";

export const decorativeAssets: Record<DecorativeCategory, AssetEntry[]> = {
  graffiti: [],
  illustrations: [],
  textures: [],
};
