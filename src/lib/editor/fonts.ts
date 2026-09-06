import { anton, archivo, bebasNeue, caveat, permanentMarker, playfairDisplay } from "@/lib/fonts";

/** Genuine typeface classifications for the 6 curated fonts below -- only
 * categories the actual roster supports (per the brief's explicit "only use
 * categories supported by the actual available fonts, do not fabricate font
 * availability"). This is a type-design classification, distinct from each
 * font's own `direction` (a creative-use label like "Streetwear" or
 * "Graffiti") -- e.g. Permanent Marker reads as a graffiti-appropriate
 * choice by direction, but as a typeface it's a handwritten/brush marker
 * face, not a genuine graffiti/wildstyle letterform, so it's classified
 * here as Handwritten. Used to group the font picker's <optgroup>s. */
export type EditorFontCategory = "Sans" | "Serif" | "Display" | "Handwritten";

/**
 * Curated text-tool fonts, one per creative direction the brief called for.
 * Canvas 2D text (what Fabric actually renders) can't resolve CSS custom
 * properties, so each entry carries the font's real resolved family name
 * (`style.fontFamily`, e.g. `"'Anton', sans-serif"`) for Fabric, plus the
 * `className` for rendering an accurate preview label in the UI.
 */
export type EditorFontOption = {
  id: string;
  label: string;
  direction: string;
  category: EditorFontCategory;
  fabricFamily: string;
  className: string;
};

export const EDITOR_FONTS: EditorFontOption[] = [
  {
    id: "archivo",
    label: "Archivo",
    direction: "Minimal",
    category: "Sans",
    fabricFamily: archivo.style.fontFamily,
    className: archivo.className,
  },
  {
    id: "playfair",
    label: "Playfair Display",
    direction: "Editorial",
    category: "Serif",
    fabricFamily: playfairDisplay.style.fontFamily,
    className: playfairDisplay.className,
  },
  {
    id: "anton",
    label: "Anton",
    direction: "Streetwear",
    category: "Display",
    fabricFamily: anton.style.fontFamily,
    className: anton.className,
  },
  {
    id: "bebas",
    label: "Bebas Neue",
    direction: "Bold",
    category: "Display",
    fabricFamily: bebasNeue.style.fontFamily,
    className: bebasNeue.className,
  },
  {
    id: "permanent-marker",
    label: "Permanent Marker",
    direction: "Graffiti",
    category: "Handwritten",
    fabricFamily: permanentMarker.style.fontFamily,
    className: permanentMarker.className,
  },
  {
    id: "caveat",
    label: "Caveat",
    direction: "Handwritten",
    category: "Handwritten",
    fabricFamily: caveat.style.fontFamily,
    className: caveat.className,
  },
];

export const DEFAULT_EDITOR_FONT = EDITOR_FONTS[0];
