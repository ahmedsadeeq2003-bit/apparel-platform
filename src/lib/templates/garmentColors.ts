import { nearestHex } from "@/lib/color";

/**
 * Curated garment color per template category, for the editorial homepage.
 * `pickContrastHex` (generic darkest-available picker) can surface a
 * template's stored neon/high-saturation color option (leftover from the
 * old dark "Bold streetwear" palette) which clashes badly against the new
 * warm ivory/terracotta direction -- this keeps every homepage garment in
 * the same muted, warm family regardless of what's in a template's stored
 * `colors` array.
 */
export const EDITORIAL_GARMENT_COLORS: Record<string, string> = {
  minimal: "#EDEADF",
  streetwear: "#26221E",
  motivational: "#8B9574",
  funny: "#C1623A",
  birthday: "#B08968",
  couples: "#D9CDBB",
  graduation: "#6E5C4C",
  football: "#3F4A3D",
  business: "#A69C8C",
  events: "#8B3A2A",
};

/**
 * The real product color closest to a template category's curated editorial
 * hex above -- the same real-color mapping Design Hub's TemplatesShowcase
 * cards already resolve for their own "Customize" link (see
 * design-hub/page.tsx's colorCorrectTemplateHref), factored out here so a
 * second caller (the editor's own `template=` handoff, see
 * app/editor/new/page.tsx) reuses the identical logic instead of
 * re-implementing it -- "the same real product/color mapping," literally
 * one system, not two copies of the same nearestHex call.
 */
export function nearestRealColorForCategory<C extends { id: string; hex: string }>(
  categorySlug: string,
  colors: C[],
): C | undefined {
  if (colors.length === 0) return undefined;
  const targetHex = EDITORIAL_GARMENT_COLORS[categorySlug] ?? colors[0].hex;
  const paletteById = Object.fromEntries(colors.map((c) => [c.id, c.hex]));
  const colorId = nearestHex(targetHex, paletteById);
  return colors.find((c) => c.id === colorId);
}
