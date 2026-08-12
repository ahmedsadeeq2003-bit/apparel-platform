import { describe, expect, it } from "vitest";
import { otherSide } from "./side";

describe("otherSide", () => {
  it("flips front to back", () => {
    expect(otherSide("front")).toBe("back");
  });

  it("flips back to front", () => {
    expect(otherSide("back")).toBe("front");
  });
});
