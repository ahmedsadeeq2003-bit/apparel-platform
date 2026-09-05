import Image from "next/image";
import { GARMENT_PHOTO_ASPECT, GARMENT_TEXTURE_OVERLAY_PCT } from "@/lib/products/garmentPhoto";

/**
 * Real photographed fabric -- texture, natural folds, and soft directional
 * shadow/highlight -- laid back over whatever's rendered inside the
 * print-area window (Fabric artwork in the live editor, a static composite
 * in CampaignGarment), so the design reads as sitting *in* the shirt's own
 * weave rather than floating on a flat rectangle above it. This is the
 * exact same photo file the base garment layer already renders, cropped
 * (via GARMENT_TEXTURE_OVERLAY_PCT's geometry, see its own comment) to
 * line up 1:1 with the same physical region -- real luminance data from
 * the actual product photo, not a synthetic gradient or filter.
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
export function GarmentTextureOverlay({ photoPath }: { photoPath: string }) {
  return (
    <Image
      src={photoPath}
      alt=""
      aria-hidden
      width={GARMENT_PHOTO_ASPECT.width}
      height={GARMENT_PHOTO_ASPECT.height}
      className="pointer-events-none absolute object-cover mix-blend-multiply opacity-[0.16]"
      style={{
        left: `${GARMENT_TEXTURE_OVERLAY_PCT.left}%`,
        top: `${GARMENT_TEXTURE_OVERLAY_PCT.top}%`,
        width: `${GARMENT_TEXTURE_OVERLAY_PCT.width}%`,
        height: `${GARMENT_TEXTURE_OVERLAY_PCT.height}%`,
      }}
    />
  );
}
