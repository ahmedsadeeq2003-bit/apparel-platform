"use client";

import { useRef, type CSSProperties } from "react";
import { TShirtMockup } from "@/components/apparel/TShirtMockup";
import { useStaticFabricPreview } from "@/hooks/useStaticFabricPreview";
import { CANVAS_SIZE } from "@/lib/editor/constants";

export function TemplatePreview({
  canvasJson,
  hex,
  side = "front",
  label,
  className = "",
  style,
}: {
  canvasJson: object;
  hex: string;
  side?: "front" | "back";
  label: string;
  className?: string;
  style?: CSSProperties;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useStaticFabricPreview(canvasRef, canvasJson, CANVAS_SIZE);

  return (
    <div
      className={`relative aspect-square overflow-hidden rounded-sm border border-border bg-surface ${className}`}
      style={style}
    >
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
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
    </div>
  );
}
