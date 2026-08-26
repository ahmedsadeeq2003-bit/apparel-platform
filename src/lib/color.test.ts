import { describe, expect, it } from "vitest";
import { nearestHex, pickContrastHex, relativeLuminance, shadeHex } from "./color";

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

describe("nearestHex", () => {
  const REAL_COLORS = { white: "#F4F2EC", black: "#0B0B0C", ashGrey: "#A8A69F", voltGreen: "#D7FF3E" };

  it("matches an exact color to itself", () => {
    expect(nearestHex("#0B0B0C", REAL_COLORS)).toBe("black");
  });

  it("matches a near-black curated color to black", () => {
    expect(nearestHex("#26221E", REAL_COLORS)).toBe("black");
  });

  it("matches a cream curated color to white", () => {
    expect(nearestHex("#EDEADF", REAL_COLORS)).toBe("white");
  });

  it("matches a muted taupe curated color to ash grey", () => {
    expect(nearestHex("#A69C8C", REAL_COLORS)).toBe("ashGrey");
  });

  it("matches a bright saturated green to volt green", () => {
    expect(nearestHex("#C8F04A", REAL_COLORS)).toBe("voltGreen");
  });

  it("returns the only key when the palette has one entry", () => {
    expect(nearestHex("#123456", { solo: "#abcdef" })).toBe("solo");
  });

  it("throws for an empty palette", () => {
    expect(() => nearestHex("#123456", {})).toThrow();
  });
});

describe("pickContrastHex", () => {
  it("picks the darkest of several colors", () => {
    expect(pickContrastHex(["#f4f2ec", "#a8a69f", "#0b0b0c"])).toBe("#0b0b0c");
  });

  it("returns the only color when there's just one", () => {
    expect(pickContrastHex(["#d7ff3e"])).toBe("#d7ff3e");
  });

  it("falls back to near-black when the list is empty", () => {
    expect(pickContrastHex([])).toBe("#0B0B0C");
  });
});
