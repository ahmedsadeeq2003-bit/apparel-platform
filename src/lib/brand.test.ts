import { describe, expect, it } from "vitest";
import { BRAND_NAME, BRAND_TAGLINE } from "./brand";

describe("brand constants", () => {
  it("exposes a non-empty brand name", () => {
    expect(BRAND_NAME.length).toBeGreaterThan(0);
  });

  it("exposes a non-empty tagline", () => {
    expect(BRAND_TAGLINE.length).toBeGreaterThan(0);
  });
});
