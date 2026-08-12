"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ProductColorPicker } from "@/components/products/ProductColorPicker";
import type { Product } from "@/lib/products/queries";

export function ProductDesignSection({ product }: { product: Product }) {
  const [selectedId, setSelectedId] = useState(product.product_colors[0]?.id);

  const editorHref = `/editor/new?${new URLSearchParams({
    product: product.slug,
    color: selectedId ?? "",
  }).toString()}`;

  return (
    <div className="grid gap-12 md:grid-cols-2">
      <ProductColorPicker
        productName={product.name}
        colors={product.product_colors}
        selectedId={selectedId}
        onSelect={setSelectedId}
      />
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-display-xl uppercase text-foreground">
          {product.name}
        </h1>
        {product.description && (
          <p className="max-w-md text-body-lg text-muted">
            {product.description}
          </p>
        )}
        <Button href={editorHref} variant="primary" className="mt-2 w-fit">
          Design this shirt
        </Button>
      </div>
    </div>
  );
}
