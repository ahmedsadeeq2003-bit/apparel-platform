import { describe, expect, it, vi } from "vitest";

// lib/editor/fonts.ts imports lib/fonts.ts, which calls next/font/google's
// loader functions (Anton(), Archivo(), ...) -- a Next.js build-time SWC
// transform that only works inside the real Next.js compiler, not under
// plain Vitest/Node (see templateFonts.test.ts's own comment on this same
// constraint). Mocked one layer lower than that test (lib/fonts.ts itself,
// not fonts.ts) so this test exercises the real EDITOR_FONTS array
// construction -- ids, labels, and the new `category` field -- rather than
// re-declaring a parallel fake array.
vi.mock("@/lib/fonts", () => {
  const fake = (family: string) => ({ style: { fontFamily: family }, className: `mock-${family}` });
  return {
    anton: fake("__Anton_mock"),
    archivo: fake("__Archivo_mock"),
    playfairDisplay: fake("__Playfair_mock"),
    permanentMarker: fake("__PermanentMarker_mock"),
    caveat: fake("__Caveat_mock"),
    bebasNeue: fake("__Bebas_mock"),
  };
});

const { EDITOR_FONTS, DEFAULT_EDITOR_FONT } = await import("./fonts");

describe("EDITOR_FONTS", () => {
  it("gives every font a unique id", () => {
    const ids = EDITOR_FONTS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("only uses category values genuinely represented in the roster (no fabricated categories)", () => {
    const categories = new Set(EDITOR_FONTS.map((f) => f.category));
    for (const category of categories) {
      expect(EDITOR_FONTS.some((f) => f.category === category)).toBe(true);
    }
    // The brief's full suggested list (Sans/Serif/Display/Handwritten/
    // Graffiti/Gothic/Retro/Editorial) is intentionally not all present --
    // only categories with a real matching typeface should appear.
    expect(categories.has("Gothic" as never)).toBe(false);
  });

  it("resolves every font to a real, non-empty Fabric family string", () => {
    for (const font of EDITOR_FONTS) {
      expect(font.fabricFamily.length).toBeGreaterThan(0);
    }
  });

  it("defaults to the first curated font", () => {
    expect(DEFAULT_EDITOR_FONT).toBe(EDITOR_FONTS[0]);
  });
});
