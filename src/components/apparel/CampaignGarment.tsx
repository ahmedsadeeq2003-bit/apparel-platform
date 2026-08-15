"use client";

import { useRef, type CSSProperties } from "react";
import { TShirtMockup, PRINT_OVERLAY_PCT } from "@/components/apparel/TShirtMockup";
import { useStaticFabricPreview } from "@/hooks/useStaticFabricPreview";
import { CANVAS_SIZE } from "@/lib/editor/constants";

/**
 * A garment rendered as a physical object in space rather than a UI card:
 * no border/background/rounded panel, a shape-accurate `drop-shadow` that
 * follows the silhouette instead of a rectangular box-shadow, and the real
 * Fabric artwork mapped onto the actual print-area position so it reads as
 * printed on the shirt rather than floating in a frame next to it. Used for
 * the homepage's campaign-style compositions; `TemplatePreview` (bordered
 * card) remains the right choice for list/grid contexts elsewhere.
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

  return (
    <div className={`relative aspect-[400/480] ${className}`} style={{ filter, ...style }}>
      <TShirtMockup
        hex={hex}
        side={side}
        crop="full"
        label={label}
        className="absolute inset-0 h-full w-full"
      />
      <div
        className="pointer-events-none absolute overflow-hidden"
        style={{
          left: `${PRINT_OVERLAY_PCT.left}%`,
          top: `${PRINT_OVERLAY_PCT.top}%`,
          width: `${PRINT_OVERLAY_PCT.width}%`,
          height: `${PRINT_OVERLAY_PCT.height}%`,
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
