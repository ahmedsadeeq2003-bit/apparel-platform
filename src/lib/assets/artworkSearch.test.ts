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
    // "anime" itself is now populated (Phase 7) -- "cars" remains a real,
    // honestly-empty tag for this case.
    const result = filterArtwork(ALL_ARTWORK, { category: "cars", query: "" });
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

describe("Phase 7 -- Anime collection", () => {
  it("registers real anime artwork under the broad 'anime' tag", () => {
    const result = filterArtwork(ALL_ARTWORK, { category: "anime", query: "" });
    // A real, substantial collection, not a token handful.
    expect(result.length).toBeGreaterThanOrEqual(15);
  });

  it("every anime substyle tag added to STYLE_TAGS has at least one real asset", () => {
    const animeSubstyles = ["samurai", "dark-fantasy", "cyberpunk-anime", "mecha", "action", "chibi", "anime-faces", "anime-streetwear"];
    for (const substyle of animeSubstyles) {
      expect(STYLE_TAGS.some((tag) => tag.value === substyle)).toBe(true);
      const matches = filterArtwork(ALL_ARTWORK, { category: substyle, query: "" });
      expect(matches.length).toBeGreaterThan(0);
    }
  });

  it("every anime-tagged piece also carries the broad 'anime' tag (substyle implies umbrella)", () => {
    const substyleValues = ["samurai", "dark-fantasy", "cyberpunk-anime", "mecha", "action", "chibi", "anime-faces", "anime-streetwear"];
    const bySubstyle = ALL_ARTWORK.filter((item) => item.tags.some((t) => substyleValues.includes(t)));
    expect(bySubstyle.length).toBeGreaterThan(0);
    expect(bySubstyle.every((item) => item.tags.includes("anime"))).toBe(true);
  });

  it("populates the pre-existing 'manga' and 'japanese' tags rather than inventing near-duplicates", () => {
    expect(filterArtwork(ALL_ARTWORK, { category: "manga", query: "" }).length).toBeGreaterThan(0);
    expect(filterArtwork(ALL_ARTWORK, { category: "japanese", query: "" }).length).toBeGreaterThan(0);
  });

  it("resolves a real anime artwork id the same way any other artwork id resolves", () => {
    const roninPath = "/assets/designs/illustration/ronin-silhouette.svg";
    const item = ALL_ARTWORK.find((entry) => entry.path === roninPath);
    expect(item).toBeDefined();
    expect(item?.id).toBe("illustration-ronin-silhouette");
    expect(item?.tags).toContain("samurai");
  });

  it("searching by substyle name as free text also finds anime artwork", () => {
    const result = filterArtwork(ALL_ARTWORK, { category: "all", query: "samurai" });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((item) => item.tags.includes("samurai"))).toBe(true);
  });

  it("existing non-anime artwork and tags are unaffected", () => {
    const streetwear = filterArtwork(ALL_ARTWORK, { category: "streetwear", query: "" });
    expect(streetwear.length).toBeGreaterThan(0);
    expect(streetwear.every((item) => !item.tags.includes("anime"))).toBe(true);
  });
});

describe("Phase 9 -- second Anime collection wave", () => {
  it("grows the anime collection beyond Phase 7's count", () => {
    const result = filterArtwork(ALL_ARTWORK, { category: "anime", query: "" });
    // Phase 7 shipped 18; this wave adds 8 more real pieces.
    expect(result.length).toBeGreaterThanOrEqual(26);
  });

  it("the new 'poster-style' tag has real assets behind it, not an empty filter", () => {
    expect(STYLE_TAGS.some((tag) => tag.value === "poster-style")).toBe(true);
    const matches = filterArtwork(ALL_ARTWORK, { category: "poster-style", query: "" });
    expect(matches.length).toBeGreaterThanOrEqual(3);
    expect(matches.every((item) => item.tags.includes("anime"))).toBe(true);
  });

  it("resolves each new Phase 9 piece by its real manifest id", () => {
    const slugs = [
      ["typography", "poster-type-mark"],
      ["typography", "neon-kana-type"],
      ["graphic-art", "rage-halftone-poster"],
      ["graphic-art", "manga-panel-grid"],
      ["illustration", "blade-kanji-mark"],
      ["illustration", "masked-ronin-bust"],
      ["graphic-art", "energy-coil-mark"],
      ["illustration", "chibi-katana-mascot"],
    ] as const;
    for (const [category, slug] of slugs) {
      const item = ALL_ARTWORK.find((entry) => entry.path === `/assets/designs/${category}/${slug}.svg`);
      expect(item).toBeDefined();
      expect(item?.id).toBe(`${category}-${slug}`);
      expect(item?.tags).toContain("anime");
    }
  });

  it("existing Phase 7 anime pieces are unaffected by this second wave", () => {
    const ronin = ALL_ARTWORK.find((item) => item.id === "illustration-ronin-silhouette");
    expect(ronin?.tags).toEqual(["anime", "samurai"]);
  });
});
