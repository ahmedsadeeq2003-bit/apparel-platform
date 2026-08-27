import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { GrainOverlay } from "@/components/marketing/GrainOverlay";
import { InspirationHero } from "@/components/inspiration/InspirationHero";
import { CreativeWorlds } from "@/components/inspiration/CreativeWorlds";
import { ArtworkLibrary } from "@/components/inspiration/ArtworkLibrary";
import { TemplatesShowcase } from "@/components/inspiration/TemplatesShowcase";
import { CustomerDesignsSection } from "@/components/inspiration/CustomerDesignsSection";
import type { CustomerSubmission } from "@/components/marketing/FreshOffThePress";
import { createClient } from "@/lib/supabase/server";
import { getAllTemplatesGrouped } from "@/lib/templates/queries";
import { getProductBySlug } from "@/lib/products/queries";

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
        <CreativeWorlds />
        <ArtworkLibrary editorHref={editorHref} />
        <TemplatesShowcase groups={templateGroups} />
        <CustomerDesignsSection submissions={customerSubmissions} />
      </main>
      <SiteFooter />
    </div>
  );
}
