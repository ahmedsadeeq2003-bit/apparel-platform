"use client";

import { motion, useReducedMotion } from "motion/react";
import { ArrowsOut, MagnifyingGlassMinus, MagnifyingGlassPlus } from "@phosphor-icons/react";
import type { EditorSide } from "@/lib/editor/side";

const EASE = [0.16, 1, 0.3, 1] as const;

export function CanvasControls({
  side,
  onSetSide,
  canShowBack,
  zoom,
  onSetZoom,
}: {
  side: EditorSide;
  onSetSide: (side: EditorSide) => void;
  /** Whether a real photo exists for the currently selected color's back
   * view. Classic Tee only has a real back photo for Black -- offering the
   * "Back" toggle for a color with no real back photo would let a customer
   * design against a garment photo that doesn't match their selection, so
   * it's hidden rather than shown disabled or silently substituted. */
  canShowBack: boolean;
  zoom: number;
  onSetZoom: (zoom: number) => void;
}) {
  const reduceMotion = useReducedMotion();
  const sides = canShowBack ? (["front", "back"] as const) : (["front"] as const);
  const activeIndex = side === "front" ? 0 : 1;

  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-background px-4 py-3">
      <div className="relative flex gap-1 rounded-full border border-border p-1">
        {canShowBack && (
          <motion.span
            aria-hidden
            className="absolute inset-y-1 w-[calc(50%-0.125rem)] rounded-full bg-foreground"
            animate={{ left: activeIndex === 0 ? 4 : "calc(50% + 1px)" }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.28, ease: EASE }}
          />
        )}
        {sides.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onSetSide(value)}
            aria-pressed={side === value}
            className={`relative z-10 rounded-full px-4 py-1.5 text-body-sm font-medium capitalize transition-colors ${
              side === value ? "text-background" : "text-muted hover:text-foreground"
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onSetZoom(zoom - 0.1)}
          aria-label="Zoom out"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground active:scale-90"
        >
          <MagnifyingGlassMinus size={16} />
        </button>
        <span className="w-11 text-center text-body-sm text-muted">{Math.round(zoom * 100)}%</span>
        <button
          type="button"
          onClick={() => onSetZoom(zoom + 0.1)}
          aria-label="Zoom in"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground active:scale-90"
        >
          <MagnifyingGlassPlus size={16} />
        </button>
        <button
          type="button"
          onClick={() => onSetZoom(1)}
          aria-label="Fit to screen"
          title="Fit to screen"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground active:scale-90"
        >
          <ArrowsOut size={16} />
        </button>
      </div>
    </div>
  );
}
