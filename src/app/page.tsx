import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Hero, type HeroShirt } from "@/components/marketing/Hero";
import { InspirationSection } from "@/components/marketing/InspirationSection";
import { DesignYourWay } from "@/components/marketing/DesignYourWay";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { BusinessSection } from "@/components/marketing/BusinessSection";
import { ValueProps } from "@/components/marketing/ValueProps";
import { FinalCta } from "@/components/marketing/FinalCta";
import { GrainOverlay } from "@/components/marketing/GrainOverlay";
import { getFeaturedTemplates } from "@/lib/templates/queries";

export default async function Home() {
  const featured = await getFeaturedTemplates();
  const bySlug = new Map(featured.map((f) => [f.category.slug, f.template]));

  const toPreview = (slug: string) => {
    const template = bySlug.get(slug);
    if (!template) return null;
    return {
      canvasJson: template.canvas_json,
      hex: template.colors[0] ?? "#F4F2EC",
      side: (template.print_area === "back" ? "back" : "front") as "front" | "back",
      label: template.name,
    };
  };

  const heroShirts = ["streetwear", "graduation", "events"]
    .map(toPreview)
    .filter((shirt): shirt is HeroShirt => shirt !== null);

  const designYourWayPreview = toPreview("couples");
  const businessUniform = toPreview("business");
  const valuePropsPreview = toPreview("minimal");

  return (
    <>
      <GrainOverlay />
      <SiteHeader />
      <main className="flex-1">
        <Hero shirts={heroShirts} />
        <InspirationSection />
        {designYourWayPreview && <DesignYourWay preview={designYourWayPreview} />}
        <HowItWorks />
        {businessUniform && <BusinessSection uniform={businessUniform} />}
        {valuePropsPreview && <ValueProps preview={valuePropsPreview} />}
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
