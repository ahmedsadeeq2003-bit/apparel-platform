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
