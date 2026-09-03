import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { GrainOverlay } from "@/components/marketing/GrainOverlay";
import { FinalCta } from "@/components/marketing/FinalCta";
import { DesignHubHero } from "@/components/inspiration/DesignHubHero";
import { ArtworkOnGarment, type GarmentDemoPiece } from "@/components/inspiration/ArtworkOnGarment";
import { ArtworkLibrary } from "@/components/inspiration/ArtworkLibrary";
import { TemplatesShowcase } from "@/components/inspiration/TemplatesShowcase";
import { CustomerDesignsSection } from "@/components/inspiration/CustomerDesignsSection";
import type { CustomerSubmission } from "@/components/marketing/FreshOffThePress";
import { createClient } from "@/lib/supabase/server";
import { getAllTemplatesGrouped, type DesignTemplate, type TemplateCategory } from "@/lib/templates/queries";
import { getProductBySlug, type ProductColor } from "@/lib/products/queries";
import { getMyDesigns } from "@/lib/editor/queries";
import { designAssets, type DesignCategory } from "@/lib/assets/manifest";
import { ARTWORK_CATEGORY_LABELS, type ArtworkItem } from "@/lib/assets/artworkSearch";
import { getGarmentPhoto } from "@/lib/products/garmentPhoto";
import { EDITORIAL_GARMENT_COLORS } from "@/lib/templates/garmentColors";
import { nearestHex } from "@/lib/color";

/** Curated for visual range across real categories and real colors -- every
 * slug/category here is a real, verified entry in designAssets. Resolved
 * against the live product/color/photo data below rather than hardcoded,
 * so a renamed or removed color/asset degrades gracefully (that piece is
 * just dropped) instead of rendering something broken. */
const DEMO_ARTWORK: { category: DesignCategory; slug: string; colorName: string }[] = [
  { category: "graffiti", slug: "hand-drawn-crown", colorName: "Black" },
  { category: "typography", slug: "good-energy", colorName: "White" },
  { category: "illustration", slug: "botanical-flower", colorName: "Ash Grey" },
  { category: "graphic-art", slug: "retro-sun", colorName: "Volt Green" },
];

function buildEditorHref(productSlug: string, colorId: string): string {
  return `/editor/new?${new URLSearchParams({ product: productSlug, color: colorId }).toString()}`;
}

/**
 * The authenticated landing page STITCH's routing architecture sends every
 * signed-in customer to: after login/signup (via `next=/design-hub`), and
 * from the homepage's "Start Designing" CTA once already authenticated, and
 * now from the header's own CTA once signed in (see SiteHeader).
 *
 * Deliberately its own page, not a reskin of /inspiration -- /inspiration
 * keeps its public, unauthenticated-browsable role unchanged. This route
 * reuses the same underlying data/components where that's genuinely the
 * same job (real artwork, real templates, the same DB-backed queries) but
 * gives Design Hub its own hero, its own section order, and drops the
 * "orient a cold visitor" CreativeWorlds cards that don't earn their place
 * on an already-authenticated, already-oriented page (see the Design Hub
 * pre-editor audit for the full reasoning).
 */
export default async function DesignHubPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/design-hub");
  }

  const [templateGroups, classicTee, savedDesigns] = await Promise.all([
    getAllTemplatesGrouped(),
    getProductBySlug("classic-tee"),
    getMyDesigns(),
  ]);

  // Same real-color-id resolution /inspiration uses for its artwork "Use
  // this" links -- Black by preference (real front + back photos), falling
  // back to whatever color exists first, never a fabricated id.
  const defaultColor =
    classicTee?.product_colors.find((color) => color.name === "Black") ?? classicTee?.product_colors[0];
  const editorHref = classicTee ? buildEditorHref(classicTee.slug, defaultColor?.id ?? "") : "/products";

  // Every real product_color's own hex, keyed by its own id -- lets
  // nearestHex() resolve straight to a real color id instead of a name,
  // for any curated/curated-adjacent hex a card happens to be previewing.
  const colorIdByHex: Record<string, string> =
    classicTee && classicTee.product_colors.length > 0
      ? Object.fromEntries(classicTee.product_colors.map((c) => [c.id, c.hex]))
      : {};

  function colorCorrectTemplateHref(template: DesignTemplate, category: TemplateCategory): string {
    if (!classicTee || Object.keys(colorIdByHex).length === 0) return editorHref;
    const previewHex = EDITORIAL_GARMENT_COLORS[category.slug] ?? defaultColor?.hex ?? "#EDEADF";
    const colorId = nearestHex(previewHex, colorIdByHex);
    return buildEditorHref(classicTee.slug, colorId);
  }

  // No per-item color exists for standalone artwork (see ArtworkLibrary's
  // own comment) -- every card still resolves to the same default color,
  // but through the same real product/color system as everything else on
  // this page rather than a hardcoded string.
  const artworkEditorHref = (_item: ArtworkItem) => editorHref;

  const demoPieces: GarmentDemoPiece[] = classicTee
    ? DEMO_ARTWORK.map(({ category, slug, colorName }) => {
        const entry = designAssets[category].find((asset) => asset.path.endsWith(`/${slug}.svg`));
        const color = classicTee.product_colors.find((c) => c.name === colorName);
        const photo = color ? getGarmentPhoto(classicTee.slug, color.name, "front") : null;
        if (!entry || !color || !photo) return null;
        return {
          id: entry.id ?? slug,
          artworkPath: entry.path,
          artworkName: entry.name ?? slug,
          categoryLabel: ARTWORK_CATEGORY_LABELS[category],
          photoPath: photo.path,
          colorName: color.name,
          editorHref: buildEditorHref(classicTee.slug, color.id),
        };
      }).filter((piece): piece is GarmentDemoPiece => piece !== null)
    : [];

  // The signed-in customer's own saved designs (see lib/editor/queries.ts
  // -- RLS-scoped to them already). Mapped into the same shape
  // CustomerDesignsSection already renders for /inspiration's anonymous
  // gallery; "side" defaults to front since a save doesn't record which
  // side the customer was last looking at.
  const colorById = new Map((classicTee?.product_colors ?? []).map((c: ProductColor) => [c.id, c]));
  const mySubmissions: CustomerSubmission[] = savedDesigns
    .map((design): CustomerSubmission | null => {
      const color = colorById.get(design.productColorId);
      if (!color) return null;
      return {
        id: design.id,
        canvasJson: design.frontCanvasJson ?? design.backCanvasJson ?? {},
        hex: color.hex,
        side: "front",
        designName: design.name,
      };
    })
    .filter((item): item is CustomerSubmission => item !== null);

  return (
    <div className="theme-editorial bg-background text-foreground">
      <GrainOverlay />
      <SiteHeader />
      <main className="flex-1 overflow-x-hidden">
        <DesignHubHero editorHref={editorHref} />
        <ArtworkOnGarment pieces={demoPieces} />
        <TemplatesShowcase groups={templateGroups} buildEditorHref={colorCorrectTemplateHref} />
        <ArtworkLibrary editorHref={artworkEditorHref} />
        <CustomerDesignsSection submissions={mySubmissions} startDesigningHref={editorHref} variant="authenticated" />
        <FinalCta startDesigningHref={editorHref} />
      </main>
      <SiteFooter />
    </div>
  );
}
