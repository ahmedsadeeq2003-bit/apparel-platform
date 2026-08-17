import type { ReactNode } from "react";
import { permanentMarker } from "@/lib/fonts";

/**
 * Small hand-drawn accents -- the "creative personality" layer sitting on
 * top of the otherwise premium/editorial base. Pure SVG, `currentColor`-
 * driven, purely ornamental (`aria-hidden`). Kept deliberately restrained:
 * one or two per section, never a graffiti wall.
 */

export function ScribbleUnderline({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 300 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={5}
      strokeLinecap="round"
    >
      <path d="M4 15C60 6 140 4 168 11C196 18 240 4 296 9" />
    </svg>
  );
}

export function BrushStroke({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 220 40" className={className} fill="currentColor">
      <path d="M4 26c18-14 46-20 74-18 30 2 46 14 74 12 24-2 44-10 66-14-6 10-30 22-58 26-32 4-52-6-82-6-26 0-56 8-74 0z" />
    </svg>
  );
}

/** A rotated, marker-written label -- real (non-decorative) text, unlike the
 * SVG marks above, so it's not `aria-hidden`. Reuses the editor's existing
 * Permanent Marker font load rather than adding a new one. One per section,
 * at most. */
export function MarkerTag({
  children,
  rotate = -4,
  className = "",
}: {
  children: ReactNode;
  rotate?: number;
  className?: string;
}) {
  return (
    <span
      className={`${permanentMarker.className} inline-block text-body-lg text-accent ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  );
}
