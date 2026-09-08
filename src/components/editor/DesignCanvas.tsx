"use client";

import type { RefObject } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { CANVAS_SIZE, GARMENT_CANVAS_OVERLAY_PCT, PRINT_SAFE_AREA_BOUNDS } from "@/lib/editor/constants";
import { GARMENT_DESIGN_TEXTURE_OVERLAY_PCT, GARMENT_PHOTO_ASPECT } from "@/lib/products/garmentPhoto";
import { GarmentTextureOverlay } from "@/components/apparel/GarmentTextureOverlay";
import type { AssetEntry } from "@/lib/assets/manifest";
import type { EditorSide } from "@/lib/editor/side";

const EASE = [0.16, 1, 0.3, 1] as const;

/** PRINT_SAFE_AREA_BOUNDS is expressed in the canvas's own 0-600 logical
 * space; converting to a percentage of the canvas wrapper here (once, at
 * module load -- these are compile-time constants) is what actually
 * positions the guide box visually within the now-larger design area. */
const PRINT_SAFE_AREA_PCT = {
  left: (PRINT_SAFE_AREA_BOUNDS.left / CANVAS_SIZE) * 100,
  top: (PRINT_SAFE_AREA_BOUNDS.top / CANVAS_SIZE) * 100,
  width: (PRINT_SAFE_AREA_BOUNDS.width / CANVAS_SIZE) * 100,
  height: (PRINT_SAFE_AREA_BOUNDS.height / CANVAS_SIZE) * 100,
};

/** One L-shaped corner bracket -- print/crop-mark language ("this is the
 * safe area," a convention from actual garment printing rather than a
 * generic dev bounding box) instead of a full dashed rectangle outlining
 * the whole region, which read as UI chrome rather than something that
 * belongs on a shirt. Four of these (one per corner, mirrored via CSS)
 * mark the print-safe region without visually dominating it. Phase 8:
 * this visual treatment was already right -- only its container moved,
 * from the canvas wrapper's own edges (when canvas === print area) to the
 * smaller PRINT_SAFE_AREA_PCT box positioned inside the now-larger canvas
 * (see the wrapping div in DesignCanvas below), so it now reads as
 * guidance sitting on a bigger design surface rather than the surface's
 * own boundary. */
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
    // `flex-1 min-h-0` is the same idiom EditorShell.tsx's own chain of
    // flex-col containers uses at every other level to receive a definite
    // height from its flex parent -- this specific div was the one link
    // missing it. Without it, this div (a flex-col item, no flex-basis
    // override) sizes to its own content instead of filling the height its
    // parent (EditorShell's "relative flex flex-1 flex-col" canvas-area
    // div) actually offers, so the photo frame below -- which asks for
    // `h-full`, 100% of *this* div -- has nothing definite to resolve
    // against and collapses to a near-zero box (confirmed via runtime
    // measurement: photoFrame reported ~2x3px). `min-h-0` keeps the
    // flex-grow result from being overridden by this item's default
    // content-based minimum height, same reason it's paired with `flex-1`
    // everywhere else in this file's ancestor chain.
    <div className="flex w-full flex-1 min-h-0 items-center justify-center overflow-auto p-6 md:p-10">
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
          {photo && <GarmentTextureOverlay photoPath={photo.path} overlayPct={GARMENT_DESIGN_TEXTURE_OVERLAY_PCT} />}
          {/* Print-safe guide -- purely visual, positioned as a
              sub-rectangle within the design canvas (PRINT_SAFE_AREA_PCT),
              not the canvas's own edges. `pointer-events-none` so it never
              intercepts drags meant for artwork anywhere else on the
              shirt. */}
          {showGuide && (
            <div
              aria-hidden
              className="pointer-events-none absolute"
              style={{
                left: `${PRINT_SAFE_AREA_PCT.left}%`,
                top: `${PRINT_SAFE_AREA_PCT.top}%`,
                width: `${PRINT_SAFE_AREA_PCT.width}%`,
                height: `${PRINT_SAFE_AREA_PCT.height}%`,
              }}
            >
              <CornerMark corner="tl" />
              <CornerMark corner="tr" />
              <CornerMark corner="bl" />
              <CornerMark corner="br" />
            </div>
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
