"use client";

import { useRef, useState } from "react";
import { useDesignEditor } from "@/hooks/useDesignEditor";
import { useEditorStore } from "@/lib/editor/store";
import { EditorToolbar } from "./EditorToolbar";
import { DesignCanvas } from "./DesignCanvas";
import type { Product, ProductColor } from "@/lib/products/queries";

export function EditorShell({
  product,
  initialColor,
}: {
  product: Product;
  initialColor: ProductColor;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const editor = useDesignEditor(canvasRef);
  const [selectedColor, setSelectedColor] = useState(initialColor);

  const side = useEditorStore((state) => state.side);
  const selectedCount = useEditorStore((state) => state.selectedObjectIds.length);
  const isDirty = useEditorStore((state) => state.isDirty);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="font-display text-display-md uppercase text-foreground">
          {product.name}
        </h1>
        <div className="mt-2 flex items-center gap-3">
          <span className="text-body-sm text-muted">{selectedColor.name}</span>
          <div className="flex gap-2">
            {product.product_colors.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => setSelectedColor(color)}
                aria-label={`Switch to ${color.name}`}
                aria-pressed={color.id === selectedColor.id}
                className={`h-6 w-6 rounded-full border-2 transition-colors ${
                  color.id === selectedColor.id ? "border-accent" : "border-border"
                }`}
                style={{ backgroundColor: color.hex }}
              />
            ))}
          </div>
        </div>
      </div>
      <EditorToolbar
        side={side}
        isDirty={isDirty}
        canDelete={selectedCount > 0}
        isReady={editor.isReady}
        onAddText={editor.addText}
        onDeleteSelected={editor.deleteSelected}
        onToggleSide={editor.toggleSide}
      />
      <DesignCanvas
        canvasRef={canvasRef}
        hex={selectedColor.hex}
        side={side}
        label={`${product.name}, ${selectedColor.name}, ${side}`}
      />
    </div>
  );
}
