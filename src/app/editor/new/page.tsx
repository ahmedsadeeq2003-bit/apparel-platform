import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProductBySlug } from "@/lib/products/queries";
import { getAllTemplatesGrouped } from "@/lib/templates/queries";
import { getDesignById } from "@/lib/editor/queries";
import {
  resolveArtworkParam,
  resolveInitialContent,
  resolveTemplateParam,
} from "@/lib/editor/initialContent";
import { nearestRealColorForCategory } from "@/lib/templates/garmentColors";
import { EditorShellLoader } from "@/components/editor/EditorShellLoader";

export default async function NewDesignPage({
  searchParams,
}: {
  searchParams: Promise<{
    product?: string;
    color?: string;
    designId?: string;
    artwork?: string;
    template?: string;
  }>;
}) {
  const { product: slug, color: colorId, designId, artwork: artworkId, template: templateId } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    const params = new URLSearchParams();
    if (slug) params.set("product", slug);
    if (colorId) params.set("color", colorId);
    if (designId) params.set("designId", designId);
    if (artworkId) params.set("artwork", artworkId);
    if (templateId) params.set("template", templateId);
    const query = params.toString();
    redirect(`/login?next=${encodeURIComponent(`/editor/new${query ? `?${query}` : ""}`)}`);
  }

  // A resolved saved design is authoritative (Phase 2 spec: "the saved
  // design is authoritative") -- it determines product/color/content, and
  // artwork/template params are never consulted alongside it. A designId
  // that doesn't resolve (deleted, mistyped, someone else's) degrades to
  // exactly the same flow as if designId were never present, rather than
  // failing the page -- an old/broken resume link should still open
  // *something* sensible instead of a dead end.
  const savedDesign = designId ? await getDesignById(designId) : null;

  const templateGroups = await getAllTemplatesGrouped();
  const resolvedTemplate = savedDesign ? null : resolveTemplateParam(templateId, templateGroups);
  const resolvedArtwork = savedDesign || resolvedTemplate ? null : resolveArtworkParam(artworkId);

  const resolvedSlug = savedDesign?.productSlug ?? slug;
  if (!resolvedSlug) {
    redirect("/design-hub");
  }

  const product = await getProductBySlug(resolvedSlug);
  if (!product) {
    notFound();
  }

  const initialColor = savedDesign
    ? (product.product_colors.find((color) => color.id === savedDesign.productColorId) ??
      product.product_colors[0])
    : colorId
      ? (product.product_colors.find((color) => color.id === colorId) ?? product.product_colors[0])
      : resolvedTemplate
        ? (nearestRealColorForCategory(resolvedTemplate.category.slug, product.product_colors) ??
          product.product_colors[0])
        : product.product_colors[0];
  if (!initialColor) {
    notFound();
  }

  const initialContent = resolveInitialContent({
    savedDesign: savedDesign
      ? { front: savedDesign.frontCanvasJson, back: savedDesign.backCanvasJson }
      : null,
    template: resolvedTemplate?.template ?? null,
    artwork: resolvedArtwork,
  });

  return (
    <main className="theme-editorial flex min-h-screen flex-col bg-background">
      <EditorShellLoader
        product={product}
        initialColor={initialColor}
        templateGroups={templateGroups}
        initialContent={initialContent}
        initialDesignId={savedDesign?.id ?? null}
        initialDesignName={savedDesign?.name ?? null}
      />
    </main>
  );
}
