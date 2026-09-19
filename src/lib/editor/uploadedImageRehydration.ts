/**
 * Phase 2 (Customer Artwork Upload): pure JSON transforms used to make a
 * resumed saved design's uploaded raster images loadable again.
 *
 * An uploaded raster image's Fabric object carries two things: a `src`
 * (whatever Supabase Storage signed URL was valid at the moment it was
 * last serialized) and a `sourcePath` (the durable Storage path behind it,
 * see useDesignEditor.ts's SERIALIZE_KEYS/placeUploadedObject). A signed
 * URL is short-lived by design (see uploadStorage.ts's
 * SIGNED_URL_TTL_SECONDS) -- whatever one got saved into
 * designs.front_canvas_json/back_canvas_json has almost certainly expired
 * by the time a customer reopens that design, so it must be re-resolved to
 * a fresh one before the canvas tries to load it, not just left as-is.
 *
 * Kept framework-agnostic (no Fabric/DOM types) and side-effect-free, per
 * this project's convention that src/lib business logic gets direct Vitest
 * coverage rather than only being reachable through a mounted hook/canvas
 * (which nothing in this codebase's test setup can do).
 */

/** Recursively finds every `sourcePath` inside a canvas_json snapshot --
 * recursing into `objects` arrays since a Group's own JSON nests its
 * children's objects under that same key (a duplicated or SVG-grouped
 * upload could in principle end up inside one). */
export function collectSourcePaths(json: object | null): string[] {
  const paths: string[] = [];
  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    const record = node as Record<string, unknown>;
    if (typeof record.sourcePath === "string") paths.push(record.sourcePath);
    if (Array.isArray(record.objects)) record.objects.forEach(walk);
  };
  walk(json);
  return paths;
}

/** Returns a deep copy of a canvas_json snapshot with every image object's
 * `src` replaced by a freshly-signed URL, matched via its `sourcePath`. An
 * object whose `sourcePath` has no entry in `freshUrls` (the re-sign
 * request failed, or simply returned fewer paths than asked) keeps
 * whatever `src` it already had rather than being blanked out -- a
 * temporarily-broken image beats a guaranteed-broken one. */
export function withRefreshedImageSources(json: object | null, freshUrls: Map<string, string>): object | null {
  if (!json) return json;
  const clone = JSON.parse(JSON.stringify(json)) as Record<string, unknown>;
  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    const record = node as Record<string, unknown>;
    if (typeof record.sourcePath === "string") {
      const fresh = freshUrls.get(record.sourcePath);
      if (fresh) record.src = fresh;
    }
    if (Array.isArray(record.objects)) record.objects.forEach(walk);
  };
  walk(clone);
  return clone;
}
