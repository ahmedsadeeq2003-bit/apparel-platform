import { GARMENT_PRINT_AREA_PCT } from "@/lib/products/garmentPhoto";

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
 * garment photo, as a percentage of the full photo -- see
 * `GARMENT_PRINT_AREA_PCT`'s own comment in garmentPhoto.ts for how this box
 * was established. DesignCanvas.tsx sizes/positions the actual `<canvas>`
 * to this box rather than rendering it full-photo-size with a smaller inset
 * guide, so the canvas's own coordinate space directly *is* the printable
 * region. */
export const GARMENT_CANVAS_OVERLAY_PCT = GARMENT_PRINT_AREA_PCT;

/** The Fabric canvas is displayed at exactly `GARMENT_CANVAS_OVERLAY_PCT`'s
 * size (see DesignCanvas.tsx), so the canvas's own full 600x600 logical
 * space -- not some smaller region within a larger canvas -- is the
 * printable area. Previously this held a sub-rectangle derived from
 * TShirtMockup's SVG crop geometry, which had no relationship to the real
 * garment photo; that mapping is gone. Still a named export (not inlined)
 * so the print guide and the object-placement clamp in useDesignEditor.ts
 * share one authoritative definition. */
export const PRINT_GUIDE_BOUNDS = { left: 0, top: 0, width: CANVAS_SIZE, height: CANVAS_SIZE } as const;
