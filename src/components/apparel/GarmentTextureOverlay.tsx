import Image from "next/image";
import { GARMENT_PHOTO_ASPECT } from "@/lib/products/garmentPhoto";

/**
 * Real photographed fabric -- texture, natural folds, and soft directional
 * shadow/highlight -- laid back over whatever's rendered inside the design
 * window (Fabric artwork in the live editor, a static composite in
 * CampaignGarment), so the design reads as sitting *in* the shirt's own
 * weave rather than floating on a flat rectangle above it. This is the
 * exact same photo file the base garment layer already renders, cropped
 * (via `overlayPct`, see its own callers) to line up 1:1 with the same
 * physical region -- real luminance data from the actual product photo,
 * not a synthetic gradient or filter.
 *
 * `overlayPct` is a prop, not an internal import, because this component
 * now serves two differently-sized windows: the live editor's canvas
 * (Phase 8's larger GARMENT_DESIGN_TEXTURE_OVERLAY_PCT) and
 * CampaignGarment's static template/artwork previews (the original,
 * smaller GARMENT_TEXTURE_OVERLAY_PCT, print-safe-area-sized) -- one
 * shared component, each caller supplying the geometry that actually
 * matches its own window, rather than two copies of this component.
 *
 * `mix-blend-mode: multiply` at a low, deliberately conservative opacity:
 * multiply is the standard technique for this (it darkens toward the
 * layer beneath rather than flattening color the way a plain filter
 * would), but at full strength it would crush light artwork on a dark
 * garment -- white ink on the black tee's darkest fold-shadow pixels would
 * multiply toward near-black. At 16% opacity even that worst case only
 * pulls white down to roughly 90% brightness (still unmistakably white),
 * while still giving every design a real, position-correct shadow/fold
 * cue. `pointer-events-none` so it never intercepts clicks meant for the
 * Fabric canvas beneath it in the live editor.
 */
export function GarmentTextureOverlay({
  photoPath,
  overlayPct,
}: {
  photoPath: string;
  overlayPct: { left: number; top: number; width: number; height: number };
}) {
  return (
    <Image
      src={photoPath}
      alt=""
      aria-hidden
      width={GARMENT_PHOTO_ASPECT.width}
      height={GARMENT_PHOTO_ASPECT.height}
      className="pointer-events-none absolute object-cover mix-blend-multiply opacity-[0.16]"
      style={{
        left: `${overlayPct.left}%`,
        top: `${overlayPct.top}%`,
        width: `${overlayPct.width}%`,
        height: `${overlayPct.height}%`,
      }}
    />
  );
}
