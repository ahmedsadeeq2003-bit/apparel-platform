import { EDITOR_FONTS } from "@/lib/editor/fonts";
import { CANVAS_TEXT_FONT_FAMILY } from "@/lib/editor/constants";

/** The DB-seeded `design_templates` rows (see supabase/seed.sql and the
 * Phase 3 starter-template migration) store loose CSS-stack font strings
 * ("Archivo, sans-serif", "Anton, sans-serif", ...) rather than the actual
 * next/font-generated family names Canvas 2D text needs to resolve the real
 * curated typeface. Covers the loose name for every curated EDITOR_FONTS
 * entry, so any DB template can reference any of the six curated fonts by
 * its plain display name and have it resolve correctly. */
export const DB_TEMPLATE_FONT_FAMILY_MAP: Record<string, string> = {
  "Archivo, sans-serif": EDITOR_FONTS.find((f) => f.id === "archivo")?.fabricFamily ?? CANVAS_TEXT_FONT_FAMILY,
  "Playfair Display, serif": EDITOR_FONTS.find((f) => f.id === "playfair")?.fabricFamily ?? CANVAS_TEXT_FONT_FAMILY,
  "Anton, sans-serif": EDITOR_FONTS.find((f) => f.id === "anton")?.fabricFamily ?? CANVAS_TEXT_FONT_FAMILY,
  "Bebas Neue, sans-serif": EDITOR_FONTS.find((f) => f.id === "bebas")?.fabricFamily ?? CANVAS_TEXT_FONT_FAMILY,
  "Permanent Marker, cursive": EDITOR_FONTS.find((f) => f.id === "permanent-marker")?.fabricFamily ?? CANVAS_TEXT_FONT_FAMILY,
  "Caveat, cursive": EDITOR_FONTS.find((f) => f.id === "caveat")?.fabricFamily ?? CANVAS_TEXT_FONT_FAMILY,
};

/** Applied to a DB template's canvas_json (front and back) before it's ever
 * loaded onto the canvas or written into history. Any text object's
 * fontFamily that matches a known loose seed string gets the real curated
 * family; anything unrecognized passes through untouched rather than being
 * forced to a guess -- an unknown value can't crash Canvas 2D text (it just
 * falls back to a generic sans), so leaving it alone is the safe default. */
export function remapTemplateFonts(canvasJson: object): object {
  const parsed = canvasJson as { objects?: Array<Record<string, unknown>> };
  if (!Array.isArray(parsed.objects)) return canvasJson;
  return {
    ...parsed,
    objects: parsed.objects.map((object) => {
      const fontFamily = object.fontFamily;
      if (typeof fontFamily !== "string") return object;
      const mapped = DB_TEMPLATE_FONT_FAMILY_MAP[fontFamily];
      return mapped ? { ...object, fontFamily: mapped } : object;
    }),
  };
}
