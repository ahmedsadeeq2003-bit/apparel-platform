"use client";

import dynamic from "next/dynamic";
import type { Product, ProductColor } from "@/lib/products/queries";

const EditorShell = dynamic(
  () => import("./EditorShell").then((mod) => mod.EditorShell),
  { ssr: false },
);

export function EditorShellLoader({
  product,
  initialColor,
}: {
  product: Product;
  initialColor: ProductColor;
}) {
  return <EditorShell product={product} initialColor={initialColor} />;
}
