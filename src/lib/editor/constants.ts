export const CANVAS_SIZE = 600;

export const DEFAULT_TEXT_CONTENT = "Your text here";
export const DEFAULT_TEXT_FONT_SIZE = 32;
export const DEFAULT_TEXT_FILL = "#0b0b0c";
// Canvas 2D text rendering doesn't resolve CSS custom properties, so this
// can't reference the next/font-generated --font-archivo variable directly
// -- falls back to a generic sans stack instead.
export const CANVAS_TEXT_FONT_FAMILY = "Archivo, ui-sans-serif, system-ui, sans-serif";
