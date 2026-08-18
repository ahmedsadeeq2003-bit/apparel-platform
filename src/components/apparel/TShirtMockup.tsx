"use client";

import { useId } from "react";
import { relativeLuminance, shadeHex } from "@/lib/color";

/**
 * Shared body/sleeve/hem silhouette for both sides -- only the neckline
 * (drawn separately below) differs between front and back.
 */
const BODY_PATH =
  "M165,58 L118,52 L60,88 C40,100 38,120 52,140 C66,152 82,160 98,166 " +
  "C92,172 86,182 84,198 C78,262 76,340 80,408 C80,420 84,428 92,430 " +
  "L308,430 C316,428 320,420 320,408 C324,340 322,262 316,198 " +
  "C314,182 308,172 302,166 C318,160 334,152 348,140 C362,120 360,100 340,88 " +
  "L282,52 L235,58";

const FRONT_NECKLINE =
  "M200,95 C178,95 165,80 165,58 " + BODY_PATH.slice(BODY_PATH.indexOf("L118")) +
  " C235,80 222,95 200,95 Z";

const BACK_NECKLINE =
  "M200,50 C192,50 180,52 170,55 " + BODY_PATH.slice(BODY_PATH.indexOf("L118")) +
  " C220,52 208,50 200,50 Z";

/** Printable region in the same 400x480 viewBox units as the paths above. */
export const PRINT_AREA = { x: 140, y: 168, width: 120, height: 150 } as const;

const VIEW_BOX_FULL = "0 0 400 480";
const PRINT_CROP = { x: 70, y: 60, width: 260, height: 260 } as const;
const VIEW_BOX_PRINT_AREA = `${PRINT_CROP.x} ${PRINT_CROP.y} ${PRINT_CROP.width} ${PRINT_CROP.height}`;

/**
 * The print-area crop region expressed as a percentage of the full 400x480
 * viewBox -- lets a full-crop garment (e.g. in a campaign composition) host
 * an artwork overlay positioned/sized in plain CSS percentages that line up
 * with where `crop="print-area"` renders that same artwork.
 */
export const PRINT_OVERLAY_PCT = {
  left: (PRINT_CROP.x / 400) * 100,
  top: (PRINT_CROP.y / 480) * 100,
  width: (PRINT_CROP.width / 400) * 100,
  height: (PRINT_CROP.height / 480) * 100,
} as const;

/**
 * The true printable region (`PRINT_AREA`) expressed as a percentage of the
 * `crop="print-area"` viewBox itself (not the full garment) -- the editor
 * canvas renders that crop edge-to-edge, so this is what a guide overlay or
 * a placement-clamp inside the editor's canvas needs to line up with.
 */
export const PRINT_AREA_WITHIN_CROP_PCT = {
  left: ((PRINT_AREA.x - PRINT_CROP.x) / PRINT_CROP.width) * 100,
  top: ((PRINT_AREA.y - PRINT_CROP.y) / PRINT_CROP.height) * 100,
  width: (PRINT_AREA.width / PRINT_CROP.width) * 100,
  height: (PRINT_AREA.height / PRINT_CROP.height) * 100,
} as const;

export function TShirtMockup({
  hex,
  side,
  crop = "full",
  label,
  className = "",
}: {
  hex: string;
  side: "front" | "back";
  crop?: "full" | "print-area";
  label?: string;
  className?: string;
}) {
  const gradientId = useId();
  const path = side === "front" ? FRONT_NECKLINE : BACK_NECKLINE;

  // Very dark garments need a *lighter* outline/fold tone to stay visible
  // against this app's dark UI -- darkening further is imperceptible.
  const isDark = relativeLuminance(hex) < 60;
  const shadow = isDark ? shadeHex(hex, 32) : shadeHex(hex, -22);
  const highlight = isDark ? shadeHex(hex, 55) : shadeHex(hex, 16);
  const outline = isDark ? shadeHex(hex, 60) : shadeHex(hex, -38);

  return (
    <svg
      role="img"
      aria-label={label ?? `${side === "front" ? "Front" : "Back"} view of a T-shirt in the selected color`}
      viewBox={crop === "full" ? VIEW_BOX_FULL : VIEW_BOX_PRINT_AREA}
      preserveAspectRatio="xMidYMid slice"
      className={className}
    >
      <defs>
        <linearGradient id={`${gradientId}-shade`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={highlight} stopOpacity={0.35} />
          <stop offset="35%" stopColor={hex} stopOpacity={0} />
          <stop offset="100%" stopColor={shadow} stopOpacity={0.45} />
        </linearGradient>
        <radialGradient id={`${gradientId}-sheen`} cx="32%" cy="18%" r="55%">
          <stop offset="0%" stopColor={highlight} stopOpacity={0.4} />
          <stop offset="100%" stopColor={highlight} stopOpacity={0} />
        </radialGradient>
        <radialGradient id={`${gradientId}-vignette`} cx="50%" cy="30%" r="75%">
          <stop offset="55%" stopColor="#000000" stopOpacity={0} />
          <stop offset="100%" stopColor="#000000" stopOpacity={0.18} />
        </radialGradient>
      </defs>

      <path d={path} fill={hex} stroke={outline} strokeWidth={3} strokeLinejoin="round" />
      <path d={path} fill={`url(#${gradientId}-sheen)`} />
      <path d={path} fill={`url(#${gradientId}-shade)`} />
      <path d={path} fill={`url(#${gradientId}-vignette)`} />

      {/* Fold hints -- sleeve drape, torso creases, and hem bunching, giving
          the flat silhouette a sense of hanging fabric volume. */}
      <path
        d="M108,180 C120,192 128,206 130,222"
        fill="none"
        stroke={shadow}
        strokeOpacity={0.4}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M292,180 C280,192 272,206 270,222"
        fill="none"
        stroke={shadow}
        strokeOpacity={0.4}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M118,240 C110,300 108,352 114,404"
        fill="none"
        stroke={shadow}
        strokeOpacity={0.22}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M282,240 C290,300 292,352 286,404"
        fill="none"
        stroke={shadow}
        strokeOpacity={0.22}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M188,150 C184,230 186,320 190,404"
        fill="none"
        stroke={shadow}
        strokeOpacity={0.16}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <path
        d="M96,398 C130,412 160,418 168,418"
        fill="none"
        stroke={shadow}
        strokeOpacity={0.3}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d="M304,398 C270,412 240,418 232,418"
        fill="none"
        stroke={shadow}
        strokeOpacity={0.3}
        strokeWidth={2}
        strokeLinecap="round"
      />

      {side === "front" && (
        <path
          d="M172,86 C182,98 218,98 228,86"
          fill="none"
          stroke={outline}
          strokeOpacity={0.9}
          strokeWidth={4}
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
