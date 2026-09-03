"use client";

import dynamic from "next/dynamic";
import type { Product, ProductColor } from "@/lib/products/queries";
import type { DesignTemplate, TemplateCategory } from "@/lib/templates/queries";
import type { InitialEditorContent } from "@/lib/editor/initialContent";

/** Shown while EditorShell's own JS chunk is still loading (dynamic +
 * ssr:false means there's genuinely nothing rendered until then) -- keeps
 * the same wording the canvas-hydration overlay inside EditorShell itself
 * uses, so there's no visible seam between "the editor hasn't loaded yet"
 * and "the editor loaded and is now loading your design." */
function EditorLoadingFallback() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <span className="text-body-sm font-medium text-muted">Loading the studio...</span>
    </div>
  );
}

const EditorShell = dynamic(
  () => import("./EditorShell").then((mod) => mod.EditorShell),
  { ssr: false, loading: EditorLoadingFallback },
);

export function EditorShellLoader({
  product,
  initialColor,
  templateGroups,
  initialContent,
  initialDesignId,
  initialDesignName,
}: {
  product: Product;
  initialColor: ProductColor;
  templateGroups: { category: TemplateCategory; templates: DesignTemplate[] }[];
  initialContent: InitialEditorContent;
  initialDesignId: string | null;
  initialDesignName: string | null;
}) {
  return (
    <EditorShell
      product={product}
      initialColor={initialColor}
      templateGroups={templateGroups}
      initialContent={initialContent}
      initialDesignId={initialDesignId}
      initialDesignName={initialDesignName}
    />
  );
}
