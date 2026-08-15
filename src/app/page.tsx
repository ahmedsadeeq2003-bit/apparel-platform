import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Hero, type HeroShirt } from "@/components/marketing/Hero";
import { InspirationSection } from "@/components/marketing/InspirationSection";
import { DesignYourWay } from "@/components/marketing/DesignYourWay";
import { MakeItYours } from "@/components/marketing/MakeItYours";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { BusinessSection } from "@/components/marketing/BusinessSection";
import { ValueProps } from "@/components/marketing/ValueProps";
import { FinalCta } from "@/components/marketing/FinalCta";
import { GrainOverlay } from "@/components/marketing/GrainOverlay";
import { getFeaturedTemplates } from "@/lib/templates/queries";
import { pickContrastHex } from "@/lib/color";

const MAKE_IT_YOURS_EXAMPLES: { slug: string; caption: string }[] = [
  { slug: "minimal", caption: "Clean typography" },
  { slug: "birthday", caption: "Placed exactly where you want it" },
  { slug: "funny", caption: "Text with a graphic accent" },
  { slug: "football", caption: "Front or back, your call" },
];

export default async function Home() {
  const featured = await getFeaturedTemplates();
  const bySlug = new Map(featured.map((f) => [f.category.slug, f.template]));

  const toPreview = (slug: string, hexOverride?: string) => {
    const template = bySlug.get(slug);
    if (!template) return null;
    return {
      canvasJson: template.canvas_json,
      hex: hexOverride ?? pickContrastHex(template.colors),
      side: (template.print_area === "back" ? "back" : "front") as "front" | "back",
      label: template.name,
    };
  };

  // Explicit color overrides for the hero: a curated, deliberately varied
  // palette (mostly black/grey with one accent pop) rather than every
  // garment defaulting to the same "darkest available" choice.
  const heroShirts = [
    toPreview("streetwear", "#0B0B0C"),
    toPreview("graduation", "#A8A69F"),
    toPreview("couples", "#A8A69F"),
    toPreview("events", "#0B0B0C"),
    toPreview("football", "#A8A69F"),
    toPreview("business", "#D7FF3E"),
  ].filter((shirt): shirt is HeroShirt => shirt !== null);

  const designYourWayPreview = toPreview("couples");
  // Grey, not the computed black -- the wordmark needs to actually read as
  // a branded uniform, not disappear tone-on-tone into the shirt.
  const businessUniform = toPreview("business", "#A8A69F");

  const makeItYoursExamples = MAKE_IT_YOURS_EXAMPLES.map(({ slug, caption }) => {
    const preview = toPreview(slug);
    return preview ? { ...preview, caption } : null;
  }).filter((example): example is NonNullable<typeof example> => example !== null);

  return (
    <div className="theme-editorial bg-background text-foreground">
      <GrainOverlay />
      <SiteHeader />
      <main className="flex-1 overflow-x-hidden">
        <Hero shirts={heroShirts} />
        {designYourWayPreview && <DesignYourWay preview={designYourWayPreview} />}
        {makeItYoursExamples.length > 0 && <MakeItYours examples={makeItYoursExamples} />}
        <InspirationSection />
        {businessUniform && <BusinessSection uniform={businessUniform} />}
        <HowItWorks />
        <ValueProps />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
