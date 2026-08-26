import { designAssets, type DesignCategory } from "@/lib/assets/manifest";

export type ArtworkItem = {
  id: string;
  name: string;
  category: DesignCategory;
  path: string;
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

/** Flattens the manifest's per-category record into one searchable list --
 * computed once at module load (designAssets is a static, build-time-known
 * registry), not recomputed per render. */
export const ALL_ARTWORK: ArtworkItem[] = ARTWORK_CATEGORIES.flatMap((category) =>
  designAssets[category].map((entry) => ({
    id: entry.id ?? entry.path,
    name: entry.name ?? entry.path,
    category,
    path: entry.path,
  })),
);

/**
 * Pure filter for the Inspiration artwork library -- `category: "all"`
 * matches everything; `query` matches against the artwork's name or its
 * category label, case-insensitively. Kept framework-agnostic (no React,
 * no DOM) so it's unit-testable without mounting the grid component, per
 * this project's convention of testing src/lib business logic directly.
 */
export function filterArtwork(
  items: ArtworkItem[],
  { category, query }: { category: DesignCategory | "all"; query: string },
): ArtworkItem[] {
  const normalizedQuery = query.trim().toLowerCase();

  return items.filter((item) => {
    if (category !== "all" && item.category !== category) return false;
    if (!normalizedQuery) return true;
    return (
      item.name.toLowerCase().includes(normalizedQuery) ||
      ARTWORK_CATEGORY_LABELS[item.category].toLowerCase().includes(normalizedQuery)
    );
  });
}
