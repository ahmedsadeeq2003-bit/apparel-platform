import { describe, expect, it } from "vitest";
import { GARMENT_CATALOG, getAvailableGarments, getComingSoonGarments } from "./garments";

describe("garment catalog", () => {
  it("classic-tee is the only available garment today", () => {
    const available = getAvailableGarments();
    expect(available).toHaveLength(1);
    expect(available[0].slug).toBe("classic-tee");
  });

  it("lists Oversized Tee, Hoodie, and Sweatshirt as not-yet-available", () => {
    const comingSoon = getComingSoonGarments().map((g) => g.slug);
    expect(comingSoon).toEqual(["oversized-tee", "hoodie", "sweatshirt"]);
  });

  it("available + coming-soon partitions the whole catalog with no overlap", () => {
    const available = getAvailableGarments();
    const comingSoon = getComingSoonGarments();
    expect(available.length + comingSoon.length).toBe(GARMENT_CATALOG.length);
    const availableSlugs = new Set(available.map((g) => g.slug));
    expect(comingSoon.every((g) => !availableSlugs.has(g.slug))).toBe(true);
  });

  it("every entry has a non-empty name and description", () => {
    for (const garment of GARMENT_CATALOG) {
      expect(garment.name.length).toBeGreaterThan(0);
      expect(garment.description.length).toBeGreaterThan(0);
    }
  });

  it("every slug is unique", () => {
    const slugs = GARMENT_CATALOG.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
