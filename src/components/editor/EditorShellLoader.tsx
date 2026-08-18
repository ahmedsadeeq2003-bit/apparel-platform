"use client";

import dynamic from "next/dynamic";
import type { Product, ProductColor } from "@/lib/products/queries";
import type { DesignTemplate, TemplateCategory } from "@/lib/templates/queries";

const EditorShell = dynamic(
  () => import("./EditorShell").then((mod) => mod.EditorShell),
  { ssr: false },
);

export function EditorShellLoader({
  product,
  initialColor,
  templateGroups,
}: {
  product: Product;
  initialColor: ProductColor;
  templateGroups: { category: TemplateCategory; templates: DesignTemplate[] }[];
}) {
  return <EditorShell product={product} initialColor={initialColor} templateGroups={templateGroups} />;
}
