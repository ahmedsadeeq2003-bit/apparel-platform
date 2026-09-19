import { describe, expect, it } from "vitest";
import {
  CANVAS_SIZE,
  DEFAULT_TEXT_CONTENT,
  DESIGN_AREA_BOUNDS,
  getGarmentCanvasOverlayPct,
  getPrintSafeAreaBounds,
} from "./constants";
import { GARMENT_DESIGN_AREA_PCT, GARMENT_PRINT_AREA_PCT } from "@/lib/products/garmentPhoto";

describe("editor constants", () => {
  it("has a positive canvas size", () => {
    expect(CANVAS_SIZE).toBeGreaterThan(0);
  });

  it("has non-empty default text content", () => {
    expect(DEFAULT_TEXT_CONTENT.length).toBeGreaterThan(0);
  });

  it("keeps the design area bounds within the canvas's own coordinate space", () => {
    expect(DESIGN_AREA_BOUNDS.left).toBeGreaterThanOrEqual(0);
    expect(DESIGN_AREA_BOUNDS.top).toBeGreaterThanOrEqual(0);
    expect(DESIGN_AREA_BOUNDS.left + DESIGN_AREA_BOUNDS.width).toBeLessThanOrEqual(CANVAS_SIZE);
    expect(DESIGN_AREA_BOUNDS.top + DESIGN_AREA_BOUNDS.height).toBeLessThanOrEqual(CANVAS_SIZE);
  });

  it("makes the entire canvas the design area, since the canvas itself is displayed at the garment overlay size", () => {
    expect(DESIGN_AREA_BOUNDS).toEqual({ left: 0, top: 0, width: CANVAS_SIZE, height: CANVAS_SIZE });
  });

  it("positions the garment canvas overlay fully within the photo bounds, for classic-tee", () => {
    const overlay = getGarmentCanvasOverlayPct("classic-tee");
    expect(overlay.left).toBeGreaterThan(0);
    expect(overlay.top).toBeGreaterThan(0);
    expect(overlay.left + overlay.width).toBeLessThanOrEqual(100);
    expect(overlay.top + overlay.height).toBeLessThanOrEqual(100);
  });

  // Phase 3 (Garment Catalog): geometry is now a function of product slug,
  // not one fixed pair of constants -- classic-tee is the only real entry
  // (see garmentPhoto.ts's GARMENT_GEOMETRY_BY_SLUG), but the *shape* of
  // the API must already support more than one garment.
  describe("per-garment geometry (Phase 3)", () => {
    it("falls back to classic-tee's geometry for an unrecognized product slug, rather than throwing", () => {
      expect(() => getGarmentCanvasOverlayPct("not-a-real-product")).not.toThrow();
      expect(getGarmentCanvasOverlayPct("not-a-real-product")).toEqual(getGarmentCanvasOverlayPct("classic-tee"));
      expect(getPrintSafeAreaBounds("not-a-real-product")).toEqual(getPrintSafeAreaBounds("classic-tee"));
    });
  });

  // Phase 8: the shirt is the canvas; the print-safe area is guidance
  // shown *inside* it, not the editing boundary.
  describe("print-safe area (Phase 8 -- guidance, not a boundary)", () => {
    it("is a genuine sub-rectangle of the design area, not the whole canvas", () => {
      const bounds = getPrintSafeAreaBounds("classic-tee");
      expect(bounds.width).toBeLessThan(DESIGN_AREA_BOUNDS.width);
      expect(bounds.height).toBeLessThan(DESIGN_AREA_BOUNDS.height);
    });

    it("stays fully within the canvas's own coordinate space", () => {
      const bounds = getPrintSafeAreaBounds("classic-tee");
      expect(bounds.left).toBeGreaterThanOrEqual(0);
      expect(bounds.top).toBeGreaterThanOrEqual(0);
      expect(bounds.left + bounds.width).toBeLessThanOrEqual(CANVAS_SIZE);
      expect(bounds.top + bounds.height).toBeLessThanOrEqual(CANVAS_SIZE);
    });

    it("covers a real, non-trivial area (not collapsed to a sliver)", () => {
      const bounds = getPrintSafeAreaBounds("classic-tee");
      expect(bounds.width).toBeGreaterThan(CANVAS_SIZE * 0.5);
      expect(bounds.height).toBeGreaterThan(CANVAS_SIZE * 0.5);
    });

    /** The real proof this geometry is correct, independent of any visual
     * check: converting getPrintSafeAreaBounds("classic-tee") (a box in the
     * canvas's own 0-600 space) back out through the same percentage math
     * DesignCanvas uses to position it on screen -- canvas-local % -> % of
     * the design area's own box -> % of the *photo* -- must land exactly
     * back on GARMENT_PRINT_AREA_PCT, the real print-safe box. If this
     * round-trip doesn't reproduce the original numbers, the guide would be
     * visibly misaligned with the actual print-safe region of the real
     * garment. */
    it("round-trips back to the exact real print-safe area on the photo", () => {
      const bounds = getPrintSafeAreaBounds("classic-tee");
      const localToDesignAreaPct = (v: number) => (v / CANVAS_SIZE) * 100;
      const designAreaToPhotoPct = (pct: number, axis: "x" | "y") => {
        const origin = axis === "x" ? GARMENT_DESIGN_AREA_PCT.left : GARMENT_DESIGN_AREA_PCT.top;
        const span = axis === "x" ? GARMENT_DESIGN_AREA_PCT.width : GARMENT_DESIGN_AREA_PCT.height;
        return origin + (pct / 100) * span;
      };

      const leftOnPhoto = designAreaToPhotoPct(localToDesignAreaPct(bounds.left), "x");
      const topOnPhoto = designAreaToPhotoPct(localToDesignAreaPct(bounds.top), "y");
      const rightOnPhoto = designAreaToPhotoPct(localToDesignAreaPct(bounds.left + bounds.width), "x");
      const bottomOnPhoto = designAreaToPhotoPct(localToDesignAreaPct(bounds.top + bounds.height), "y");

      expect(leftOnPhoto).toBeCloseTo(GARMENT_PRINT_AREA_PCT.left, 6);
      expect(topOnPhoto).toBeCloseTo(GARMENT_PRINT_AREA_PCT.top, 6);
      expect(rightOnPhoto).toBeCloseTo(GARMENT_PRINT_AREA_PCT.left + GARMENT_PRINT_AREA_PCT.width, 6);
      expect(bottomOnPhoto).toBeCloseTo(GARMENT_PRINT_AREA_PCT.top + GARMENT_PRINT_AREA_PCT.height, 6);
    });
  });
});
