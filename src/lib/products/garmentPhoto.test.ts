import { describe, expect, it } from "vitest";
import { GARMENT_PRINT_AREA_PCT, GARMENT_TEXTURE_OVERLAY_PCT } from "./garmentPhoto";

/**
 * The texture-overlay geometry is derived algebra (see its own comment in
 * garmentPhoto.ts), not a second hand-eyeballed constant -- what actually
 * matters is that a full-size copy of the photo, placed with this box's
 * left/top/width/height (all as percentages of the *print-area window*,
 * per normal CSS absolute-positioning rules), lines up 1:1 with the same
 * region of the base photo underneath. Verified here by simulating that
 * exact positioning math for a concrete point (the print area's own
 * top-left corner) and confirming it resolves back to itself.
 */
describe("GARMENT_TEXTURE_OVERLAY_PCT", () => {
  it("aligns the overlay's crop with the base photo's own print area", () => {
    // A point at the print area's own top-left, expressed as a percentage
    // of the *photo* (the base layer's coordinate space).
    const pointOnPhotoPct = { x: GARMENT_PRINT_AREA_PCT.left, y: GARMENT_PRINT_AREA_PCT.top };

    // The same point's position within the print-area *window* (the
    // overlay's containing block) -- 0%, since it's exactly the window's
    // own top-left corner by construction.
    const pointInWindowPct = { x: 0, y: 0 };

    // Where that point lands on the overlay IMAGE itself: the window
    // position minus the overlay's own offset, scaled back down by the
    // overlay's width/height (converting from "percent of window" to
    // "percent of the oversized overlay image").
    const pointOnOverlayImagePct = {
      x: (pointInWindowPct.x - GARMENT_TEXTURE_OVERLAY_PCT.left) / (GARMENT_TEXTURE_OVERLAY_PCT.width / 100),
      y: (pointInWindowPct.y - GARMENT_TEXTURE_OVERLAY_PCT.top) / (GARMENT_TEXTURE_OVERLAY_PCT.height / 100),
    };

    // Since the overlay image is the same photo at the same natural scale,
    // this must equal the point's original position on the photo.
    expect(pointOnOverlayImagePct.x).toBeCloseTo(pointOnPhotoPct.x, 5);
    expect(pointOnOverlayImagePct.y).toBeCloseTo(pointOnPhotoPct.y, 5);
  });

  it("aligns at the print area's bottom-right corner too", () => {
    const pointOnPhotoPct = {
      x: GARMENT_PRINT_AREA_PCT.left + GARMENT_PRINT_AREA_PCT.width,
      y: GARMENT_PRINT_AREA_PCT.top + GARMENT_PRINT_AREA_PCT.height,
    };
    const pointInWindowPct = { x: 100, y: 100 };
    const pointOnOverlayImagePct = {
      x: (pointInWindowPct.x - GARMENT_TEXTURE_OVERLAY_PCT.left) / (GARMENT_TEXTURE_OVERLAY_PCT.width / 100),
      y: (pointInWindowPct.y - GARMENT_TEXTURE_OVERLAY_PCT.top) / (GARMENT_TEXTURE_OVERLAY_PCT.height / 100),
    };
    expect(pointOnOverlayImagePct.x).toBeCloseTo(pointOnPhotoPct.x, 5);
    expect(pointOnOverlayImagePct.y).toBeCloseTo(pointOnPhotoPct.y, 5);
  });

  it("scales the overlay up by exactly the inverse of the print area's own size", () => {
    expect(GARMENT_TEXTURE_OVERLAY_PCT.width).toBeCloseTo((100 / GARMENT_PRINT_AREA_PCT.width) * 100, 5);
    expect(GARMENT_TEXTURE_OVERLAY_PCT.height).toBeCloseTo((100 / GARMENT_PRINT_AREA_PCT.height) * 100, 5);
  });
});
