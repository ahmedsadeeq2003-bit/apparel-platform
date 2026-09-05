import { describe, expect, it, vi } from "vitest";

// lib/editor/fonts.ts transitively imports lib/fonts.ts, which calls
// next/font/google's loader functions (Anton(), Archivo(), ...) -- a
// Next.js build-time SWC transform that only works inside the actual
// Next.js compiler, not under plain Vitest/Node. Mocked here with
// predictable fabricFamily values so this test exercises the real
// remapping logic without needing that build-time machinery, the same
// reason no other test in this repo imports lib/editor/fonts.ts directly.
vi.mock("./fonts", () => ({
  EDITOR_FONTS: [
    { id: "archivo", label: "Archivo", direction: "Minimal", fabricFamily: "__Archivo_mock", className: "" },
    { id: "playfair", label: "Playfair Display", direction: "Editorial", fabricFamily: "__Playfair_mock", className: "" },
    { id: "anton", label: "Anton", direction: "Streetwear", fabricFamily: "__Anton_mock", className: "" },
    { id: "bebas", label: "Bebas Neue", direction: "Bold", fabricFamily: "__Bebas_mock", className: "" },
    { id: "permanent-marker", label: "Permanent Marker", direction: "Graffiti", fabricFamily: "__PermanentMarker_mock", className: "" },
    { id: "caveat", label: "Caveat", direction: "Handwritten", fabricFamily: "__Caveat_mock", className: "" },
  ],
}));

const { DB_TEMPLATE_FONT_FAMILY_MAP, remapTemplateFonts } = await import("./templateFonts");
const { EDITOR_FONTS } = await import("./fonts");
const { CANVAS_TEXT_FONT_FAMILY } = await import("./constants");

describe("DB_TEMPLATE_FONT_FAMILY_MAP", () => {
  it("covers every curated editor font by its loose display name", () => {
    const mapped = new Set(Object.values(DB_TEMPLATE_FONT_FAMILY_MAP));
    for (const font of EDITOR_FONTS) {
      expect(mapped.has(font.fabricFamily)).toBe(true);
    }
  });
});

describe("remapTemplateFonts", () => {
  it("remaps a known loose font string to the real curated family", () => {
    const archivo = EDITOR_FONTS.find((f) => f.id === "archivo")!;
    const input = { objects: [{ type: "IText", fontFamily: "Archivo, sans-serif", text: "HELLO" }] };
    const result = remapTemplateFonts(input) as { objects: { fontFamily: string }[] };
    expect(result.objects[0].fontFamily).toBe(archivo.fabricFamily);
  });

  it("remaps every curated loose name used across the starter templates", () => {
    const cases: [string, string][] = [
      ["Archivo, sans-serif", "archivo"],
      ["Playfair Display, serif", "playfair"],
      ["Anton, sans-serif", "anton"],
      ["Bebas Neue, sans-serif", "bebas"],
      ["Caveat, cursive", "caveat"],
    ];
    for (const [loose, id] of cases) {
      const font = EDITOR_FONTS.find((f) => f.id === id)!;
      const input = { objects: [{ type: "IText", fontFamily: loose }] };
      const result = remapTemplateFonts(input) as { objects: { fontFamily: string }[] };
      expect(result.objects[0].fontFamily).toBe(font.fabricFamily);
    }
  });

  it("leaves an unrecognized fontFamily untouched rather than guessing", () => {
    const input = { objects: [{ type: "IText", fontFamily: "Comic Sans MS" }] };
    const result = remapTemplateFonts(input) as { objects: { fontFamily: string }[] };
    expect(result.objects[0].fontFamily).toBe("Comic Sans MS");
  });

  it("leaves non-text objects untouched", () => {
    const input = { objects: [{ type: "Circle", radius: 10, fill: "#000" }] };
    const result = remapTemplateFonts(input);
    expect(result).toEqual(input);
  });

  it("passes through canvas_json with no objects array unchanged", () => {
    const input = { version: "7.4.0" };
    expect(remapTemplateFonts(input)).toBe(input);
  });

  it("never leaves a mapped family equal to the generic fallback", () => {
    for (const family of Object.values(DB_TEMPLATE_FONT_FAMILY_MAP)) {
      expect(family).not.toBe(CANVAS_TEXT_FONT_FAMILY);
    }
  });
});
