import { describe, expect, it } from "vitest";
import { CANVAS_SIZE, DEFAULT_TEXT_CONTENT, GARMENT_CANVAS_OVERLAY_PCT, PRINT_GUIDE_BOUNDS } from "./constants";

describe("editor constants", () => {
  it("has a positive canvas size", () => {
    expect(CANVAS_SIZE).toBeGreaterThan(0);
  });

  it("has non-empty default text content", () => {
    expect(DEFAULT_TEXT_CONTENT.length).toBeGreaterThan(0);
  });

  it("keeps the print guide bounds within the canvas's own coordinate space", () => {
    expect(PRINT_GUIDE_BOUNDS.left).toBeGreaterThanOrEqual(0);
    expect(PRINT_GUIDE_BOUNDS.top).toBeGreaterThanOrEqual(0);
    expect(PRINT_GUIDE_BOUNDS.left + PRINT_GUIDE_BOUNDS.width).toBeLessThanOrEqual(CANVAS_SIZE);
    expect(PRINT_GUIDE_BOUNDS.top + PRINT_GUIDE_BOUNDS.height).toBeLessThanOrEqual(CANVAS_SIZE);
  });

  it("makes the entire canvas the printable area, since the canvas itself is displayed at the garment overlay size", () => {
    expect(PRINT_GUIDE_BOUNDS).toEqual({ left: 0, top: 0, width: CANVAS_SIZE, height: CANVAS_SIZE });
  });

  it("positions the garment canvas overlay fully within the photo bounds", () => {
    expect(GARMENT_CANVAS_OVERLAY_PCT.left).toBeGreaterThan(0);
    expect(GARMENT_CANVAS_OVERLAY_PCT.top).toBeGreaterThan(0);
    expect(GARMENT_CANVAS_OVERLAY_PCT.left + GARMENT_CANVAS_OVERLAY_PCT.width).toBeLessThanOrEqual(100);
    expect(GARMENT_CANVAS_OVERLAY_PCT.top + GARMENT_CANVAS_OVERLAY_PCT.height).toBeLessThanOrEqual(100);
  });
});
