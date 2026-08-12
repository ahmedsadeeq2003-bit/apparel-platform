"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductColor } from "@/lib/products/queries";

export function ProductColorPicker({
  productName,
  colors,
}: {
  productName: string;
  colors: ProductColor[];
}) {
  const [selectedId, setSelectedId] = useState(colors[0]?.id);
  const selected = colors.find((color) => color.id === selectedId) ?? colors[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="relative aspect-square overflow-hidden rounded-sm border border-border bg-background">
        {selected?.front_mockup_url && (
          <Image
            src={selected.front_mockup_url}
            alt={`${productName} in ${selected.name}`}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 45vw, 90vw"
          />
        )}
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-body-sm text-muted">
          Color: {selected?.name}
        </span>
        <div className="flex gap-3">
          {colors.map((color) => (
            <button
              key={color.id}
              type="button"
              onClick={() => setSelectedId(color.id)}
              aria-label={color.name}
              aria-pressed={color.id === selectedId}
              className={`h-10 w-10 rounded-full border-2 transition-colors ${
                color.id === selectedId ? "border-accent" : "border-border"
              }`}
              // DB-driven swatch color, not a hardcoded literal -- the one
              // justified exception to token-only colors (see product_colors.hex).
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
