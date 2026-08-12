"use client";

import { TShirtMockup } from "@/components/apparel/TShirtMockup";
import type { ProductColor } from "@/lib/products/queries";

export function ProductColorPicker({
  productName,
  colors,
  selectedId,
  onSelect,
}: {
  productName: string;
  colors: ProductColor[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}) {
  const selected = colors.find((color) => color.id === selectedId) ?? colors[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="relative aspect-square overflow-hidden rounded-sm border border-border bg-background">
        {selected && (
          <TShirtMockup
            hex={selected.hex}
            side="front"
            crop="full"
            label={`${productName} in ${selected.name}`}
            className="h-full w-full"
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
              onClick={() => onSelect(color.id)}
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
