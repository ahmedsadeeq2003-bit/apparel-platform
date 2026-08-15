/**
 * Lightens or darkens a hex color by `percent` (-100..100). Negative
 * darkens toward black, positive lightens toward white. Used to derive
 * shading/highlight tones from a single product color at render time
 * instead of storing pre-shaded assets per color.
 */
export function shadeHex(hex: string, percent: number): string {
  const normalized = hex.replace("#", "");
  const bigint = parseInt(normalized.length === 3
    ? normalized.split("").map((c) => c + c).join("")
    : normalized, 16);

  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  const amount = Math.round(2.55 * percent);
  const clamp = (value: number) => Math.max(0, Math.min(255, value + amount));

  const toHex = (value: number) => value.toString(16).padStart(2, "0");

  return `#${toHex(clamp(r))}${toHex(clamp(g))}${toHex(clamp(b))}`;
}

/**
 * Perceived brightness of a hex color on a 0 (black) - 255 (white) scale,
 * via the standard luma weighting. Used to decide whether a garment needs
 * a lightened or darkened outline to stay visible against a dark UI.
 */
export function relativeLuminance(hex: string): number {
  const normalized = hex.replace("#", "");
  const bigint = parseInt(normalized.length === 3
    ? normalized.split("").map((c) => c + c).join("")
    : normalized, 16);

  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Picks the darkest color from a template's color list. Seeded templates
 * often list a cream/white garment first, which is fine against the app's
 * old dark theme but disappears against the light editorial homepage --
 * this keeps garment silhouettes visible without hardcoding per-template
 * overrides everywhere a template's colors are rendered.
 */
export function pickContrastHex(colors: string[]): string {
  if (colors.length === 0) return "#0B0B0C";
  return colors.reduce((darkest, candidate) =>
    relativeLuminance(candidate) < relativeLuminance(darkest) ? candidate : darkest,
  );
}
