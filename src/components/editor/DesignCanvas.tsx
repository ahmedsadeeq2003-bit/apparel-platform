"use client";

import type { RefObject } from "react";
import { TShirtMockup } from "@/components/apparel/TShirtMockup";
import { CANVAS_SIZE, PRINT_GUIDE_BOUNDS } from "@/lib/editor/constants";
import type { EditorSide } from "@/lib/editor/side";

export function DesignCanvas({
  canvasRef,
  hex,
  side,
  label,
  zoom,
  showGuide,
}: {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  hex: string;
  side: EditorSide;
  label: string;
  zoom: number;
  showGuide: boolean;
}) {
  return (
    <div className="flex w-full items-center justify-center overflow-auto p-6 md:p-10">
      <div
        className="relative aspect-square w-full max-w-[600px] shrink-0 overflow-hidden rounded-sm border border-border bg-surface shadow-sm"
        style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
      >
        <TShirtMockup
          hex={hex}
          side={side}
          crop="print-area"
          label={label}
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
        <canvas ref={canvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="absolute inset-0 h-full w-full" />
        {showGuide && (
          <div
            aria-hidden
            className="pointer-events-none absolute rounded-[2px] border border-dashed border-accent/50"
            style={{
              left: `${(PRINT_GUIDE_BOUNDS.left / CANVAS_SIZE) * 100}%`,
              top: `${(PRINT_GUIDE_BOUNDS.top / CANVAS_SIZE) * 100}%`,
              width: `${(PRINT_GUIDE_BOUNDS.width / CANVAS_SIZE) * 100}%`,
              height: `${(PRINT_GUIDE_BOUNDS.height / CANVAS_SIZE) * 100}%`,
            }}
          />
        )}
      </div>
    </div>
  );
}
