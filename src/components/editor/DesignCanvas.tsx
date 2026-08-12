"use client";

import Image from "next/image";
import type { RefObject } from "react";
import { CANVAS_SIZE } from "@/lib/editor/constants";

export function DesignCanvas({
  canvasRef,
  mockupUrl,
  alt,
}: {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  mockupUrl: string | null;
  alt: string;
}) {
  return (
    <div className="relative aspect-square w-full max-w-[600px] overflow-hidden rounded-sm border border-border bg-surface">
      {mockupUrl && (
        <Image
          src={mockupUrl}
          alt={alt}
          fill
          className="pointer-events-none object-cover"
          sizes="(min-width: 768px) 600px, 90vw"
        />
      )}
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
