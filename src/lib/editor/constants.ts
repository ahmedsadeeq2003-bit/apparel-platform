import { GARMENT_DESIGN_AREA_PCT, GARMENT_PRINT_AREA_PCT } from "@/lib/products/garmentPhoto";

export const CANVAS_SIZE = 600;

export const DEFAULT_TEXT_CONTENT = "Your text here";
export const DEFAULT_TEXT_FONT_SIZE = 32;
export const DEFAULT_TEXT_FILL = "#1b1815";
// Canvas 2D text rendering doesn't resolve CSS custom properties, so this
// can't reference the next/font-generated --font-archivo variable directly
// -- falls back to a generic sans stack instead. The editor's font picker
// (src/lib/editor/fonts.ts) overrides this per-object with a real resolved
// family name once the user picks a font.
export const CANVAS_TEXT_FONT_FAMILY = "Archivo, ui-sans-serif, system-ui, sans-serif";

/** Where the Fabric canvas element itself is displayed on top of the real
 * garment photo, as a percentage of the full photo. Phase 8: this is now
 * the much larger `GARMENT_DESIGN_AREA_PCT` (most of the visible torso),
 * not the smaller print-safe box -- the shirt itself is the canvas; the
 * print-safe area is guidance shown *inside* it (see PRINT_SAFE_AREA_BOUNDS
 * below), not the editing boundary. DesignCanvas.tsx sizes/positions the
 * actual `<canvas>` to this box, so the canvas's own coordinate space
 * directly *is* this larger design surface. */
export const GARMENT_CANVAS_OVERLAY_PCT = GARMENT_DESIGN_AREA_PCT;

/** The Fabric canvas is displayed at exactly `GARMENT_CANVAS_OVERLAY_PCT`'s
 * size (see DesignCanvas.tsx), so the canvas's own full 600x600 logical
 * space -- not some smaller region within a larger canvas -- is the design
 * area. Named `DESIGN_AREA_BOUNDS` (not "print guide") because that's
 * genuinely its only remaining job: the soft drag-back-into-view clamp in
 * useDesignEditor.ts's clampToDesignArea, not a print-safe restriction. */
export const DESIGN_AREA_BOUNDS = { left: 0, top: 0, width: CANVAS_SIZE, height: CANVAS_SIZE } as const;

/** The real print-safe area (GARMENT_PRINT_AREA_PCT, unchanged, still the
 * same box CampaignGarment's static previews use), re-expressed as a
 * sub-rectangle *within* the canvas's own 0-600 logical space -- i.e.
 * where on the now-larger canvas that smaller, production-accurate box
 * actually falls. Shown as a purely visual guide (DesignCanvas.tsx's
 * corner marks) -- it does not constrain object placement, movement, or
 * scaling; `DESIGN_AREA_BOUNDS` above is the only bound editing actually
 * respects. */
export const PRINT_SAFE_AREA_BOUNDS = {
  left: ((GARMENT_PRINT_AREA_PCT.left - GARMENT_DESIGN_AREA_PCT.left) / GARMENT_DESIGN_AREA_PCT.width) * CANVAS_SIZE,
  top: ((GARMENT_PRINT_AREA_PCT.top - GARMENT_DESIGN_AREA_PCT.top) / GARMENT_DESIGN_AREA_PCT.height) * CANVAS_SIZE,
  width: (GARMENT_PRINT_AREA_PCT.width / GARMENT_DESIGN_AREA_PCT.width) * CANVAS_SIZE,
  height: (GARMENT_PRINT_AREA_PCT.height / GARMENT_DESIGN_AREA_PCT.height) * CANVAS_SIZE,
} as const;

/** Customer upload limits -- generous enough for real phone-camera photos
 * and scanned logos, small enough that a design stays practical to store as
 * a base64 data URL inside `designs.front_canvas_json`/`back_canvas_json`
 * (the existing save format, unchanged by Phase 6 -- see the Save/Resume
 * report). No dimension floor: a small raster still previews and prints
 * fine, just softer; only an upper bound matters here. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_UPLOAD_DIMENSION = 6000;

/** Raster types the upload pipeline accepts, plus SVG -- SVG is parsed
 * through Fabric's own `loadSVGFromString` (the same trusted, existing path
 * the artwork library already uses; see loadSvgAssetObject/insertSvgAsset
 * in useDesignEditor.ts), which turns markup into plain vector drawing
 * objects and never attaches it to the live DOM, so it can't execute
 * embedded scripts -- unlike, say, rendering the file with
 * dangerouslySetInnerHTML or an <object>/<iframe> tag. */
export const ACCEPTED_UPLOAD_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"] as const;
