import { describe, expect, it } from "vitest";
import { CANVAS_SIZE, DEFAULT_TEXT_CONTENT } from "./constants";

describe("editor constants", () => {
  it("has a positive canvas size", () => {
    expect(CANVAS_SIZE).toBeGreaterThan(0);
  });

  it("has non-empty default text content", () => {
    expect(DEFAULT_TEXT_CONTENT.length).toBeGreaterThan(0);
  });
});
