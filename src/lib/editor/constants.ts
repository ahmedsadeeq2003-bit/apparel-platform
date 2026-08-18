import { PRINT_AREA_WITHIN_CROP_PCT } from "@/components/apparel/TShirtMockup";

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

/** The real printable region, in the 600x600 editor canvas's own pixel
 * space -- derived from TShirtMockup's crop geometry so the guide overlay
 * and the placement clamp always agree with what the mockup actually
 * renders as "on the shirt." */
export const PRINT_GUIDE_BOUNDS = {
  left: (PRINT_AREA_WITHIN_CROP_PCT.left / 100) * CANVAS_SIZE,
  top: (PRINT_AREA_WITHIN_CROP_PCT.top / 100) * CANVAS_SIZE,
  width: (PRINT_AREA_WITHIN_CROP_PCT.width / 100) * CANVAS_SIZE,
  height: (PRINT_AREA_WITHIN_CROP_PCT.height / 100) * CANVAS_SIZE,
} as const;
