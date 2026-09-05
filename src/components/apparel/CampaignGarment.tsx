"use client";

import { useRef, type CSSProperties } from "react";
import Image from "next/image";
import { useStaticFabricPreview } from "@/hooks/useStaticFabricPreview";
import { CANVAS_SIZE } from "@/lib/editor/constants";
import { shirtAssets } from "@/lib/assets/manifest";
import { nearestHex } from "@/lib/color";
import { GarmentTextureOverlay } from "@/components/apparel/GarmentTextureOverlay";

/** The four real photographed Classic Tee front colors (see
 * src/lib/assets/manifest.ts -- shirtAssets.classicTee), matching the real
 * `product_colors` hexes exactly. Every marketing use of this component
 * renders one of these real photos now instead of the flat hand-drawn
 * TShirtMockup SVG. `hex` (the template's curated color, e.g. terracotta or
 * sage -- not itself a photographed color) picks whichever real photo reads
 * closest via nearestHex, so different templates still land on visibly
 * different real garments instead of all defaulting to one. */
const REAL_COLOR_HEX = { white: "#F4F2EC", black: "#0B0B0C", ashGrey: "#A8A69F", voltGreen: "#D7FF3E" };
const FRONT_PHOTO_BY_COLOR = {
  white: shirtAssets.classicTee.white.front,
  black: shirtAssets.classicTee.black.front,
  ashGrey: shirtAssets.classicTee.ashGrey.front,
  voltGreen: shirtAssets.classicTee.voltGreen.front,
};
// Only black has a real photographed back (the other three source photos
// were front-only shoots) -- every back-side render falls back to it rather
// than inventing a back photo that doesn't exist.
const BACK_PHOTO = shirtAssets.classicTee.black.back;
const PHOTO_ASPECT = { width: 784, height: 1168 };

/** The canvas overlay's position as a percentage of the real photo --
 * eyeballed from the photo itself (collar, shoulder seams, natural chest/
 * upper-back print placement), the same approach used for the hero's
 * settling mark in Hero.tsx. Not derived from TShirtMockup's
 * PRINT_OVERLAY_PCT, which is specific to that SVG's own viewBox geometry
 * and has no relationship to this image's actual proportions. Exported so
 * other real-photo compositions (e.g. Design Hub's artwork-on-garment
 * demonstration) line up with the same print area instead of re-eyeballing
 * their own, possibly-inconsistent numbers.
 *
 * Kept as its own literal here (not imported) rather than sourced from
 * `garmentPhoto.ts`'s identical `GARMENT_PRINT_AREA_PCT` -- this file
 * already imports `CANVAS_SIZE` from `lib/editor/constants`, which imports
 * `GARMENT_PRINT_AREA_PCT` from `garmentPhoto.ts`, so importing it here too
 * would be circular. Keep both values in sync if this ever changes. */
export const PHOTO_OVERLAY_PCT = { left: 21, top: 17, width: 58, height: 44 };

/**
 * A garment rendered as a physical object in space rather than a UI card:
 * no border/background/rounded panel, a shape-accurate `drop-shadow` that
 * follows the photo's own edge, and the real Fabric artwork mapped onto the
 * garment's actual print-area position so it reads as printed on the shirt
 * rather than floating in a frame next to it. Used for the homepage's
 * campaign-style compositions; `TemplatePreview` (bordered card) remains
 * the right choice for list/grid contexts elsewhere.
 */
export function CampaignGarment({
  canvasJson,
  hex,
  side = "front",
  label,
  blurPx = 0,
  shadowIntensity = 1,
  className = "",
  style,
}: {
  canvasJson: object;
  hex: string;
  side?: "front" | "back";
  label: string;
  blurPx?: number;
  shadowIntensity?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useStaticFabricPreview(canvasRef, canvasJson, CANVAS_SIZE);

  const filter = [
    blurPx > 0 ? `blur(${blurPx}px)` : "",
    `drop-shadow(0 ${18 * shadowIntensity}px ${28 * shadowIntensity}px rgba(22,20,15,${0.24 * shadowIntensity}))`,
    `drop-shadow(0 ${4 * shadowIntensity}px ${6 * shadowIntensity}px rgba(22,20,15,${0.16 * shadowIntensity}))`,
  ]
    .filter(Boolean)
    .join(" ");

  const photo = side === "back" ? BACK_PHOTO : FRONT_PHOTO_BY_COLOR[nearestHex(hex, REAL_COLOR_HEX)];

  return (
    <div
      // Literal (not built from PHOTO_ASPECT) -- Tailwind's class scanner
      // only picks up arbitrary values it can see as a static string.
      className={`relative aspect-[784/1168] ${className}`}
      style={{ filter, ...style }}
    >
      <Image
        src={photo.path}
        alt={label}
        width={PHOTO_ASPECT.width}
        height={PHOTO_ASPECT.height}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        className="pointer-events-none absolute overflow-hidden"
        style={{
          left: `${PHOTO_OVERLAY_PCT.left}%`,
          top: `${PHOTO_OVERLAY_PCT.top}%`,
          width: `${PHOTO_OVERLAY_PCT.width}%`,
          height: `${PHOTO_OVERLAY_PCT.height}%`,
        }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
        {/* Real fabric texture/shadow, printed-on-fabric realism -- see
            GarmentTextureOverlay's own comment. */}
        <GarmentTextureOverlay photoPath={photo.path} />
      </div>
    </div>
  );
}
