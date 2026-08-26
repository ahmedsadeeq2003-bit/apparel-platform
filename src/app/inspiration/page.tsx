import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { GrainOverlay } from "@/components/marketing/GrainOverlay";
import { InspirationHero } from "@/components/inspiration/InspirationHero";
import { CreativeWorlds } from "@/components/inspiration/CreativeWorlds";
import { ArtworkLibrary } from "@/components/inspiration/ArtworkLibrary";
import { TemplatesShowcase } from "@/components/inspiration/TemplatesShowcase";
import { CustomerDesignsSection } from "@/components/inspiration/CustomerDesignsSection";
import type { CustomerSubmission } from "@/components/marketing/FreshOffThePress";
import { getAllTemplatesGrouped } from "@/lib/templates/queries";
import { getProductBySlug } from "@/lib/products/queries";

/** Same `.theme-editorial` treatment as the homepage/Products (see
 * tokens.css). Reuses the existing `getAllTemplatesGrouped` query (already
 * powering the editor's own Templates panel) and `getProductBySlug` (already
 * powering /products) rather than introducing any new data-fetching path --
 * this page's whole job is presenting real, already-live data differently,
 * not sourcing new data. */
export default async function InspirationPage() {
  const [templateGroups, classicTee] = await Promise.all([
    getAllTemplatesGrouped(),
    getProductBySlug("classic-tee"),
  ]);

  // Black by preference (real front + back photos, strongest contrast for
  // most artwork), falling back to whatever color exists first if the seed
  // data ever changes -- never a fabricated color id.
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

  return (
    <div className="theme-editorial bg-background text-foreground">
      <GrainOverlay />
      <SiteHeader />
      <main className="flex-1 overflow-x-hidden">
        <InspirationHero />
        <CreativeWorlds />
        <ArtworkLibrary editorHref={editorHref} />
        <TemplatesShowcase groups={templateGroups} />
        <CustomerDesignsSection submissions={customerSubmissions} />
      </main>
      <SiteFooter />
    </div>
  );
}
