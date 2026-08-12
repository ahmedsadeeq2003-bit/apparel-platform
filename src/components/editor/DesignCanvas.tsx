"use client";

import type { RefObject } from "react";
import { TShirtMockup } from "@/components/apparel/TShirtMockup";
import { CANVAS_SIZE } from "@/lib/editor/constants";
import type { EditorSide } from "@/lib/editor/side";

export function DesignCanvas({
  canvasRef,
  hex,
  side,
  label,
}: {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  hex: string;
  side: EditorSide;
  label: string;
}) {
  return (
    <div className="relative aspect-square w-full max-w-[600px] overflow-hidden rounded-sm border border-border bg-surface">
      <TShirtMockup
        hex={hex}
        side={side}
        crop="print-area"
        label={label}
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
