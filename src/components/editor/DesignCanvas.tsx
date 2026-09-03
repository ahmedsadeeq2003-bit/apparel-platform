"use client";

import type { RefObject } from "react";
import Image from "next/image";
import { CANVAS_SIZE, GARMENT_CANVAS_OVERLAY_PCT } from "@/lib/editor/constants";
import { GARMENT_PHOTO_ASPECT } from "@/lib/products/garmentPhoto";
import type { AssetEntry } from "@/lib/assets/manifest";
import type { EditorSide } from "@/lib/editor/side";

export function DesignCanvas({
  canvasRef,
  photo,
  side,
  label,
  zoom,
  showGuide,
}: {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  /** The real garment photo for the current product/color/side, resolved by
   * the caller via `getGarmentPhoto()` -- `null` only if no real photo could
   * be resolved (see the `!photo` branch below for how that's handled). */
  photo: AssetEntry | null;
  side: EditorSide;
  label: string;
  zoom: number;
  showGuide: boolean;
}) {
  return (
    <div className="flex w-full items-center justify-center overflow-auto p-6 md:p-10">
      <div
        className="relative mx-auto h-full max-h-[70vh] w-auto shrink-0 overflow-hidden rounded-sm border border-border bg-surface shadow-sm"
        style={{
          aspectRatio: `${GARMENT_PHOTO_ASPECT.width} / ${GARMENT_PHOTO_ASPECT.height}`,
          transform: `scale(${zoom})`,
          transformOrigin: "center",
        }}
      >
        {photo && (
          <Image
            src={photo.path}
            alt={label}
            width={GARMENT_PHOTO_ASPECT.width}
            height={GARMENT_PHOTO_ASPECT.height}
            priority
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div
          className={`absolute overflow-hidden rounded-[2px] ${
            showGuide ? "border border-dashed border-accent/50" : ""
          }`}
          style={{
            left: `${GARMENT_CANVAS_OVERLAY_PCT.left}%`,
            top: `${GARMENT_CANVAS_OVERLAY_PCT.top}%`,
            width: `${GARMENT_CANVAS_OVERLAY_PCT.width}%`,
            height: `${GARMENT_CANVAS_OVERLAY_PCT.height}%`,
          }}
        >
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="absolute inset-0 h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}
