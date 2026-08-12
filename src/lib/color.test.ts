import { describe, expect, it } from "vitest";
import { relativeLuminance, shadeHex } from "./color";

describe("shadeHex", () => {
  it("darkens a color toward black with a negative percent", () => {
    expect(shadeHex("#808080", -20)).toBe("#4d4d4d");
  });

  it("lightens a color toward white with a positive percent", () => {
    expect(shadeHex("#808080", 20)).toBe("#b3b3b3");
  });

  it("expands a 3-digit hex before shading", () => {
    expect(shadeHex("#fff", -10)).toBe("#e6e6e6");
  });

  it("clamps at black and white", () => {
    expect(shadeHex("#000000", -50)).toBe("#000000");
    expect(shadeHex("#ffffff", 50)).toBe("#ffffff");
  });
});

describe("relativeLuminance", () => {
  it("returns 0 for black", () => {
    expect(relativeLuminance("#000000")).toBe(0);
  });

  it("returns 255 for white", () => {
    expect(relativeLuminance("#ffffff")).toBe(255);
  });

  it("rates a dark color lower than a light color", () => {
    expect(relativeLuminance("#0b0b0c")).toBeLessThan(relativeLuminance("#f4f2ec"));
  });
});
