import { describe, expect, it } from "vitest";
import { ALL_ARTWORK, ARTWORK_FILTERS, filterArtwork, STYLE_TAGS } from "@/lib/assets/artworkSearch";

describe("filterArtwork", () => {
  it("returns every piece for category 'all' and an empty query", () => {
    expect(filterArtwork(ALL_ARTWORK, { category: "all", query: "" })).toHaveLength(ALL_ARTWORK.length);
  });

  it("filters down to a single category", () => {
    const result = filterArtwork(ALL_ARTWORK, { category: "graffiti", query: "" });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((item) => item.category === "graffiti")).toBe(true);
  });

  it("matches by name, case-insensitively", () => {
    const result = filterArtwork(ALL_ARTWORK, { category: "all", query: "CROWN" });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((item) => item.name.toLowerCase().includes("crown"))).toBe(true);
  });

  it("matches a category label used as a search term", () => {
    const result = filterArtwork(ALL_ARTWORK, { category: "all", query: "typography" });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((item) => item.category === "typography")).toBe(true);
  });

  it("combines an active category with a query", () => {
    const result = filterArtwork(ALL_ARTWORK, { category: "minimal", query: "star" });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((item) => item.category === "minimal" && item.name.toLowerCase().includes("star"))).toBe(
      true,
    );
  });

  it("returns an empty array when nothing matches", () => {
    expect(filterArtwork(ALL_ARTWORK, { category: "all", query: "zzz-nonexistent-artwork" })).toHaveLength(0);
  });

  it("filters by a style tag, independent of the category pills", () => {
    const result = filterArtwork(ALL_ARTWORK, { category: "streetwear", query: "" });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((item) => item.tags.includes("streetwear"))).toBe(true);
    // A tag filter is a genuinely separate axis from `category` -- it
    // doesn't just happen to equal one DesignCategory's own membership.
    expect(result.length).not.toBe(ALL_ARTWORK.filter((item) => item.category === result[0].category).length);
  });

  it("matches a style tag used as a search term", () => {
    const result = filterArtwork(ALL_ARTWORK, { category: "all", query: "icons" });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((item) => item.tags.includes("icons"))).toBe(true);
  });

  it("returns an empty (not missing) result for a style tag with no assets yet", () => {
    const result = filterArtwork(ALL_ARTWORK, { category: "anime", query: "" });
    expect(result).toHaveLength(0);
  });

  it("lists every style tag as a filter chip, populated or not", () => {
    expect(ARTWORK_FILTERS.length).toBeGreaterThanOrEqual(STYLE_TAGS.length);
    for (const tag of STYLE_TAGS) {
      expect(ARTWORK_FILTERS.some((f) => f.value === tag.value)).toBe(true);
    }
  });

  it("gives every artwork item a tags array, even if empty", () => {
    expect(ALL_ARTWORK.every((item) => Array.isArray(item.tags))).toBe(true);
  });
});
