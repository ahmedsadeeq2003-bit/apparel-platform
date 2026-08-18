/**
 * Pure display-label lookup, deliberately kept out of `queries.ts` -- that
 * file imports the server-only Supabase client, which taints the whole
 * module for bundling purposes. A Client Component importing so much as one
 * runtime value from a server-only-tainted file pulls the server client
 * into the browser bundle and breaks the build.
 */
const DESIGN_TYPE_LABELS: Record<string, string> = {
  simple_text: "Typography",
  text_small_graphic: "Typography",
  full_color_illustration: "Illustration",
  detailed_artwork: "Illustration",
  minimal_design: "Illustration",
  photo_print: "Photography",
  large_front_graphic: "Graphic Art",
  multiple_colors: "Graphic Art",
  oversized_front_print: "Graphic Art",
  large_back_print: "Graphic Art",
  front_and_back: "Graphic Art",
  small_chest_logo: "Graphic Art",
};

/** Human-readable category label for a template's `design_type`, used as
 * the small pill badge on gallery cards (Typography / Illustration /
 * Photography / Graphic Art). Falls back to "Graphic Art" for any
 * production design_type not yet mapped above. */
export function designTypeLabel(designType: string): string {
  return DESIGN_TYPE_LABELS[designType] ?? "Graphic Art";
}
