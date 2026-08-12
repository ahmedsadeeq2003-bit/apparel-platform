"use client";

import { useRef } from "react";
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

  const side = useEditorStore((state) => state.side);
  const selectedCount = useEditorStore((state) => state.selectedObjectIds.length);
  const isDirty = useEditorStore((state) => state.isDirty);

  const mockupUrl =
    side === "front" ? initialColor.front_mockup_url : initialColor.back_mockup_url;

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="font-display text-display-md uppercase text-foreground">
          {product.name}
        </h1>
        <p className="text-body-sm text-muted">{initialColor.name}</p>
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
        mockupUrl={mockupUrl}
        alt={`${product.name} — ${initialColor.name}, ${side}`}
      />
    </div>
  );
}
