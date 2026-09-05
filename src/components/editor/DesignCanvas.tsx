"use client";

import type { RefObject } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { CANVAS_SIZE, GARMENT_CANVAS_OVERLAY_PCT } from "@/lib/editor/constants";
import { GARMENT_PHOTO_ASPECT } from "@/lib/products/garmentPhoto";
import { GarmentTextureOverlay } from "@/components/apparel/GarmentTextureOverlay";
import type { AssetEntry } from "@/lib/assets/manifest";
import type { EditorSide } from "@/lib/editor/side";

const EASE = [0.16, 1, 0.3, 1] as const;

/** One L-shaped corner bracket -- print/crop-mark language ("this is the
 * safe area," a convention from actual garment printing rather than a
 * generic dev bounding box) instead of a full dashed rectangle outlining
 * the whole region, which read as UI chrome rather than something that
 * belongs on a shirt. Four of these (one per corner, mirrored via CSS)
 * mark the print-safe region without visually dominating it. */
function CornerMark({ corner }: { corner: "tl" | "tr" | "bl" | "br" }) {
  const isRight = corner === "tr" || corner === "br";
  const isBottom = corner === "bl" || corner === "br";
  return (
    <span
      aria-hidden
      className="absolute h-4 w-4 border-accent/60"
      style={{
        [isRight ? "right" : "left"]: -1,
        [isBottom ? "bottom" : "top"]: -1,
        borderTopWidth: isBottom ? 0 : 1.5,
        borderBottomWidth: isBottom ? 1.5 : 0,
        borderLeftWidth: isRight ? 0 : 1.5,
        borderRightWidth: isRight ? 1.5 : 0,
      }}
    />
  );
}

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
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex w-full items-center justify-center overflow-auto p-6 md:p-10">
      <motion.div
        className="relative mx-auto h-full max-h-[70vh] w-auto shrink-0 overflow-hidden rounded-sm border border-border bg-surface shadow-sm"
        style={{
          aspectRatio: `${GARMENT_PHOTO_ASPECT.width} / ${GARMENT_PHOTO_ASPECT.height}`,
          transform: `scale(${zoom})`,
          transformOrigin: "center",
        }}
        initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: EASE }}
      >
        {/* Only the photo layer remounts/crossfades on a front-back switch
            -- NOT this wrapper or the canvas below it. The live <canvas>
            element must keep its exact DOM identity for the session's
            entire lifetime: useDesignEditor's Fabric.Canvas instance is
            constructed once, tied permanently to that one node, and would
            be silently orphaned by any remount here. */}
        {photo && (
          <motion.div
            key={photo.path}
            className="absolute inset-0"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <Image
              src={photo.path}
              alt={label}
              width={GARMENT_PHOTO_ASPECT.width}
              height={GARMENT_PHOTO_ASPECT.height}
              priority
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            />
          </motion.div>
        )}
        <div
          className="absolute overflow-hidden"
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
          {/* Real fabric texture/shadow, printed-on-fabric realism -- see
              GarmentTextureOverlay's own comment. Stacked after the canvas
              so it paints on top of the artwork, not just the blank photo. */}
          {photo && <GarmentTextureOverlay photoPath={photo.path} />}
          {showGuide && (
            <>
              <CornerMark corner="tl" />
              <CornerMark corner="tr" />
              <CornerMark corner="bl" />
              <CornerMark corner="br" />
            </>
          )}
        </div>
        {showGuide && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute left-3 top-3 rounded-full border border-border bg-background/85 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted backdrop-blur-sm"
            initial={reduceMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
          >
            {side}
          </motion.span>
        )}
      </motion.div>
    </div>
  );
}
