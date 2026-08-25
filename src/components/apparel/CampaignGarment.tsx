"use client";

import { useRef, type CSSProperties } from "react";
import Image from "next/image";
import { useStaticFabricPreview } from "@/hooks/useStaticFabricPreview";
import { CANVAS_SIZE } from "@/lib/editor/constants";
import { shirtAssets } from "@/lib/assets/manifest";

/** The one real photographed Classic Tee color today (see
 * src/lib/assets/manifest.ts -- shirtAssets.classicTee.black). Every
 * marketing use of this component renders that real photo now instead of
 * the flat hand-drawn TShirtMockup SVG, front or back per `side`. `hex`
 * stays in the prop type (every call site still passes the template's
 * curated color) but no longer tints anything -- there's nothing to tint
 * once the base is a photo, not an SVG path -- kept so call sites don't all
 * need editing again the moment a second real color exists. */
const SHIRT_PHOTO = { front: shirtAssets.classicTee.black.front, back: shirtAssets.classicTee.black.back };
const PHOTO_ASPECT = { width: 784, height: 1168 };

/** The canvas overlay's position as a percentage of the real photo --
 * eyeballed from the photo itself (collar, shoulder seams, natural chest/
 * upper-back print placement), the same approach used for the hero's
 * settling mark in Hero.tsx. Not derived from TShirtMockup's
 * PRINT_OVERLAY_PCT, which is specific to that SVG's own viewBox geometry
 * and has no relationship to this image's actual proportions. */
const PHOTO_OVERLAY_PCT = { left: 21, top: 17, width: 58, height: 44 };

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept in the prop type for every call site (see SHIRT_PHOTO comment above); genuinely unused now that the base is a photo, not a tintable SVG path
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

  const photo = SHIRT_PHOTO[side];

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
      </div>
    </div>
  );
}
