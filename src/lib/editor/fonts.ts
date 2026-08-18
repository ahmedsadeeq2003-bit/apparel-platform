import { anton, archivo, bebasNeue, caveat, permanentMarker, playfairDisplay } from "@/lib/fonts";

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
  fabricFamily: string;
  className: string;
};

export const EDITOR_FONTS: EditorFontOption[] = [
  {
    id: "archivo",
    label: "Archivo",
    direction: "Minimal",
    fabricFamily: archivo.style.fontFamily,
    className: archivo.className,
  },
  {
    id: "playfair",
    label: "Playfair Display",
    direction: "Editorial",
    fabricFamily: playfairDisplay.style.fontFamily,
    className: playfairDisplay.className,
  },
  {
    id: "anton",
    label: "Anton",
    direction: "Streetwear",
    fabricFamily: anton.style.fontFamily,
    className: anton.className,
  },
  {
    id: "bebas",
    label: "Bebas Neue",
    direction: "Bold",
    fabricFamily: bebasNeue.style.fontFamily,
    className: bebasNeue.className,
  },
  {
    id: "permanent-marker",
    label: "Permanent Marker",
    direction: "Graffiti",
    fabricFamily: permanentMarker.style.fontFamily,
    className: permanentMarker.className,
  },
  {
    id: "caveat",
    label: "Caveat",
    direction: "Handwritten",
    fabricFamily: caveat.style.fontFamily,
    className: caveat.className,
  },
];

export const DEFAULT_EDITOR_FONT = EDITOR_FONTS[0];
