import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { GrainOverlay } from "@/components/marketing/GrainOverlay";
import { FinalCta } from "@/components/marketing/FinalCta";
import { InspirationHero } from "@/components/inspiration/InspirationHero";
import { CreativeWorlds } from "@/components/inspiration/CreativeWorlds";
import { ArtworkOnGarment, type GarmentDemoPiece } from "@/components/inspiration/ArtworkOnGarment";
import { ArtworkLibrary } from "@/components/inspiration/ArtworkLibrary";
import { TemplatesShowcase } from "@/components/inspiration/TemplatesShowcase";
import { CustomerDesignsSection } from "@/components/inspiration/CustomerDesignsSection";
import type { CustomerSubmission } from "@/components/marketing/FreshOffThePress";
import { createClient } from "@/lib/supabase/server";
import { getAllTemplatesGrouped } from "@/lib/templates/queries";
import { getProductBySlug } from "@/lib/products/queries";
import { designAssets, type DesignCategory } from "@/lib/assets/manifest";
import { ARTWORK_CATEGORY_LABELS } from "@/lib/assets/artworkSearch";
import { getGarmentPhoto } from "@/lib/products/garmentPhoto";

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

/**
 * The authenticated landing page STITCH's routing architecture sends every
 * signed-in customer to: after login/signup (via `next=/design-hub`), and
 * from the homepage's "Start Designing" CTA once already authenticated.
 * Deliberately built on the exact same real sections as the public
 * /inspiration page (CreativeWorlds, ArtworkLibrary, TemplatesShowcase,
 * CustomerDesignsSection are imported unchanged, not re-implemented) --
 * see the routing-architecture report for why this is a *second page*
 * reusing those components rather than /inspiration itself being gated:
 * /inspiration keeps its existing public, unauthenticated-browsable role
 * (nav link, marketing top-of-funnel), while this route adds the one thing
 * that role can't have -- a hard auth gate plus a "Start Design" CTA that
 * jumps straight into a blank editor session.
 */
export default async function DesignHubPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/design-hub");
  }

  const [templateGroups, classicTee] = await Promise.all([
    getAllTemplatesGrouped(),
    getProductBySlug("classic-tee"),
  ]);

  // Same real-color-id resolution /inspiration uses for its artwork "Use
  // this" links -- Black by preference (real front + back photos),
  // falling back to whatever color exists first, never a fabricated id.
  const defaultColor =
    classicTee?.product_colors.find((color) => color.name === "Black") ?? classicTee?.product_colors[0];
  const editorHref = classicTee
    ? `/editor/new?${new URLSearchParams({
        product: classicTee.slug,
        color: defaultColor?.id ?? "",
      }).toString()}`
    : "/products";

  // No public "customer designs" data source exists yet -- see
  // CustomerDesignsSection's own comment. Always real, never fabricated.
  const customerSubmissions: CustomerSubmission[] = [];

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
          editorHref: `/editor/new?${new URLSearchParams({
            product: classicTee.slug,
            color: color.id,
          }).toString()}`,
        };
      }).filter((piece): piece is GarmentDemoPiece => piece !== null)
    : [];

  return (
    <div className="theme-editorial bg-background text-foreground">
      <GrainOverlay />
      <SiteHeader />
      <main className="flex-1 overflow-x-hidden">
        <InspirationHero
          eyebrow="Welcome back"
          headline={[{ text: "Here's what" }, { text: "you can create.", italic: true }]}
          subcopy="Real artwork, real templates, real garments -- pick one below, or start from a blank canvas."
          backgroundLabel="DESIGN HUB"
          cta={{ href: editorHref, label: "Start Design" }}
        />
        <ArtworkOnGarment pieces={demoPieces} />
        <CreativeWorlds />
        <ArtworkLibrary editorHref={editorHref} />
        <TemplatesShowcase groups={templateGroups} />
        <CustomerDesignsSection submissions={customerSubmissions} startDesigningHref={editorHref} />
        <FinalCta startDesigningHref={editorHref} />
      </main>
      <SiteFooter />
    </div>
  );
}
