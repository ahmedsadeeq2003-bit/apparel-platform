import { describe, expect, it } from "vitest";
import { toCharSpacing } from "./textSpacing";

describe("toCharSpacing", () => {
  it("converts a template's px-style letterSpacing to Fabric's per-mille-of-em charSpacing", () => {
    // fontSize 130, letterSpacing 8 (the "Crowned" template's ROYALTY text)
    expect(toCharSpacing(8, 130)).toBe(62);
    // fontSize 150, letterSpacing 6 (the README's RIOT example)
    expect(toCharSpacing(6, 150)).toBe(40);
  });

  it("is scale-invariant: the same tracking ratio yields the same charSpacing regardless of fontSize", () => {
    expect(toCharSpacing(10, 100)).toBe(toCharSpacing(20, 200));
  });

  it("returns 0 when letterSpacing is absent or zero", () => {
    expect(toCharSpacing(undefined, 130)).toBe(0);
    expect(toCharSpacing(0, 130)).toBe(0);
  });

  it("guards against a zero or negative fontSize instead of dividing by it", () => {
    expect(toCharSpacing(8, 0)).toBe(0);
    expect(toCharSpacing(8, -10)).toBe(0);
  });
});
