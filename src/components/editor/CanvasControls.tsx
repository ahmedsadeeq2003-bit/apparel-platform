"use client";

import { ArrowsOut, MagnifyingGlassMinus, MagnifyingGlassPlus } from "@phosphor-icons/react";
import type { EditorSide } from "@/lib/editor/side";

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
  const sides = canShowBack ? (["front", "back"] as const) : (["front"] as const);
  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border bg-background px-4 py-3">
      <div className="flex gap-1 rounded-full border border-border p-1">
        {sides.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onSetSide(value)}
            aria-pressed={side === value}
            className={`rounded-full px-4 py-1.5 text-body-sm font-medium capitalize transition-colors ${
              side === value ? "bg-foreground text-background" : "text-muted hover:text-foreground"
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
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
        >
          <MagnifyingGlassMinus size={16} />
        </button>
        <span className="w-11 text-center text-body-sm text-muted">{Math.round(zoom * 100)}%</span>
        <button
          type="button"
          onClick={() => onSetZoom(zoom + 0.1)}
          aria-label="Zoom in"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
        >
          <MagnifyingGlassPlus size={16} />
        </button>
        <button
          type="button"
          onClick={() => onSetZoom(1)}
          aria-label="Fit to screen"
          title="Fit to screen"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
        >
          <ArrowsOut size={16} />
        </button>
      </div>
    </div>
  );
}
