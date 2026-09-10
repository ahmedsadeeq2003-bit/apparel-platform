import { designAssets, type DesignCategory } from "@/lib/assets/manifest";

export type ArtworkItem = {
  id: string;
  name: string;
  category: DesignCategory;
  path: string;
  tags: string[];
};

export const ARTWORK_CATEGORIES: DesignCategory[] = [
  "typography",
  "graffiti",
  "illustration",
  "abstract",
  "minimal",
  "graphic-art",
];

export const ARTWORK_CATEGORY_LABELS: Record<DesignCategory, string> = {
  typography: "Typography",
  graffiti: "Graffiti",
  illustration: "Illustration",
  abstract: "Abstract",
  minimal: "Minimal",
  "graphic-art": "Graphic Art",
};

/**
 * Style/subject filters, independent of the six structural categories
 * above. This is a plain, ordered array of `{value, label}` -- not a closed
 * TS union like `DesignCategory` -- specifically so the library can grow
 * toward the full creative vocabulary (anime, streetwear, gaming, and so
 * on) as a *data* change (tag existing/new entries, add one line here)
 * rather than a type change every time. Several of these have zero assets
 * today and are shown anyway (a real, honest "more coming soon" filter,
 * not hidden until populated) -- see AssetEntry's own comment on `tags`
 * for why an asset can carry any of these without belonging to a matching
 * DesignCategory.
 */
export const STYLE_TAGS: { value: string; label: string }[] = [
  { value: "streetwear", label: "Streetwear" },
  { value: "retro", label: "Retro" },
  { value: "nature", label: "Nature" },
  { value: "animals", label: "Animals" },
  { value: "experimental", label: "Experimental" },
  { value: "icons", label: "Icons" },
  { value: "stickers", label: "Stickers" },
  { value: "anime", label: "Anime" },
  // Phase 7: genuine Anime substyles, added alongside real artwork tagged
  // with each one (see manifest.ts's STYLE_TAGS_BY_SLUG) -- not a
  // speculative full list of every substyle the brief suggested, only the
  // ones this collection actually has pieces for.
  { value: "samurai", label: "Samurai / Ronin" },
  { value: "dark-fantasy", label: "Dark Fantasy" },
  { value: "cyberpunk-anime", label: "Cyberpunk Anime" },
  { value: "mecha", label: "Mecha" },
  { value: "action", label: "Action / Dynamic" },
  { value: "chibi", label: "Chibi / Cute" },
  { value: "anime-faces", label: "Anime Faces" },
  { value: "anime-streetwear", label: "Anime Streetwear" },
  // Phase 9: a second Anime substyle wave, added alongside real artwork
  // tagged with it (see manifest.ts's STYLE_TAGS_BY_SLUG) -- same rule as
  // Phase 7's tags: only added because real pieces back it.
  { value: "poster-style", label: "Poster Style" },
  { value: "cartoon", label: "Cartoon" },
  { value: "manga", label: "Manga / Ink" },
  { value: "japanese", label: "Japanese Traditional" },
  { value: "gaming", label: "Gaming" },
  { value: "sports", label: "Sports" },
  { value: "music", label: "Music" },
  { value: "cars", label: "Cars" },
  { value: "african", label: "African-inspired" },
];

/** The combined filter chip list the artwork browsers actually render:
 * structural categories first (always populated), then style tags (mixed
 * populated/empty) -- one filter row, one predicate (`matchesFilter`
 * below), rather than two separate filter UIs for "category" vs "tag." */
export const ARTWORK_FILTERS: { value: string; label: string }[] = [
  ...ARTWORK_CATEGORIES.map((value) => ({ value, label: ARTWORK_CATEGORY_LABELS[value] })),
  ...STYLE_TAGS,
];

/** Flattens the manifest's per-category record into one searchable list --
 * computed once at module load (designAssets is a static, build-time-known
 * registry), not recomputed per render. */
export const ALL_ARTWORK: ArtworkItem[] = ARTWORK_CATEGORIES.flatMap((category) =>
  designAssets[category].map((entry) => ({
    id: entry.id ?? entry.path,
    name: entry.name ?? entry.path,
    category,
    path: entry.path,
    tags: entry.tags ?? [],
  })),
);

function matchesFilter(item: ArtworkItem, filterValue: string): boolean {
  return item.category === filterValue || item.tags.includes(filterValue);
}

/**
 * Pure filter for the artwork library (both the external Inspiration/Design
 * Hub browser and the editor's own panel share this) -- `filter: "all"`
 * matches everything; any other value matches either a structural category
 * or a style tag (the same predicate, since a filter chip can be either,
 * see ARTWORK_FILTERS). `query` matches against the artwork's name,
 * category label, or any of its tags, case-insensitively. Kept framework-
 * agnostic (no React, no DOM) so it's unit-testable without mounting the
 * grid component, per this project's convention of testing src/lib
 * business logic directly.
 */
export function filterArtwork(
  items: ArtworkItem[],
  { category, query }: { category: string | "all"; query: string },
): ArtworkItem[] {
  const normalizedQuery = query.trim().toLowerCase();

  return items.filter((item) => {
    if (category !== "all" && !matchesFilter(item, category)) return false;
    if (!normalizedQuery) return true;
    return (
      item.name.toLowerCase().includes(normalizedQuery) ||
      ARTWORK_CATEGORY_LABELS[item.category].toLowerCase().includes(normalizedQuery) ||
      item.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
    );
  });
}
