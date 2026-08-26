import { describe, expect, it } from "vitest";
import { ALL_ARTWORK, filterArtwork } from "@/lib/assets/artworkSearch";

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
});
