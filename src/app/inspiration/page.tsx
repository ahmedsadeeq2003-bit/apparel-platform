import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { GrainOverlay } from "@/components/marketing/GrainOverlay";
import { InspirationHero } from "@/components/inspiration/InspirationHero";
import { CreativeWorlds } from "@/components/inspiration/CreativeWorlds";
import { ArtworkLibrary } from "@/components/inspiration/ArtworkLibrary";
import { TemplatesShowcase } from "@/components/inspiration/TemplatesShowcase";
import { CustomerDesignsSection } from "@/components/inspiration/CustomerDesignsSection";
import type { CustomerSubmission } from "@/components/marketing/FreshOffThePress";
import { getAllTemplatesGrouped, type DesignTemplate, type TemplateCategory } from "@/lib/templates/queries";
import { getProductBySlug } from "@/lib/products/queries";
import { nearestRealColorForCategory } from "@/lib/templates/garmentColors";
import { buildEditorHref } from "@/lib/editor/initialContent";
import type { ArtworkItem } from "@/lib/assets/artworkSearch";

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
  const editorHref = classicTee ? buildEditorHref(classicTee.slug, defaultColor?.id ?? "") : "/products";

  // "Use this"/"Customize" now carry the specific artwork/template through
  // to the editor (same content-continuity contract Design Hub uses) rather
  // than opening a blank canvas the customer has to re-find the same piece
  // inside -- the public/authenticated distinction this page keeps is about
  // who can browse it, not about whether a selection actually arrives.
  const artworkEditorHref = (item: ArtworkItem) =>
    classicTee ? buildEditorHref(classicTee.slug, defaultColor?.id ?? "", { artwork: item.id }) : editorHref;

  function templateEditorHref(template: DesignTemplate, category: TemplateCategory): string {
    if (!classicTee) return editorHref;
    const color = nearestRealColorForCategory(category.slug, classicTee.product_colors) ?? defaultColor;
    if (!color) return editorHref;
    return buildEditorHref(classicTee.slug, color.id, { template: template.id });
  }

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
        <ArtworkLibrary editorHref={artworkEditorHref} />
        <TemplatesShowcase groups={templateGroups} buildEditorHref={templateEditorHref} />
        <CustomerDesignsSection submissions={customerSubmissions} />
      </main>
      <SiteFooter />
    </div>
  );
}
