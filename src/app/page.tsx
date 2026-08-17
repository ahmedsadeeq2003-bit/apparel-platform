import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Hero } from "@/components/marketing/Hero";
import { WhatIsStitch } from "@/components/marketing/WhatIsStitch";
import { DesignYourWay } from "@/components/marketing/DesignYourWay";
import { MakeItYours } from "@/components/marketing/MakeItYours";
import { DesignLibrarySection } from "@/components/marketing/DesignLibrarySection";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { FreshOffThePress, type CustomerSubmission } from "@/components/marketing/FreshOffThePress";
import { BusinessSection } from "@/components/marketing/BusinessSection";
import { ValueProps } from "@/components/marketing/ValueProps";
import { FinalCta } from "@/components/marketing/FinalCta";
import { GrainOverlay } from "@/components/marketing/GrainOverlay";
import { getFeaturedTemplates } from "@/lib/templates/queries";
import { EDITORIAL_GARMENT_COLORS } from "@/lib/templates/garmentColors";

const MAKE_IT_YOURS_EXAMPLES: { slug: string; caption: string }[] = [
  { slug: "minimal", caption: "Clean typography" },
  { slug: "birthday", caption: "Placed exactly where you want it" },
  { slug: "funny", caption: "Text with a graphic accent" },
  { slug: "football", caption: "Front or back, your call" },
];

// No real customer submissions exist yet (see FreshOffThePress -- checkout
// doesn't write these, no opt-in gallery/moderation flow is built). This
// fallback set is real STITCH-library designs, clearly labeled as such by
// the component itself, not presented as customer work.
const FRESH_OFF_THE_PRESS_FALLBACK: { slug: string }[] = [
  { slug: "streetwear" },
  { slug: "motivational" },
  { slug: "events" },
  { slug: "business" },
  { slug: "couples" },
  { slug: "funny" },
];

export default async function Home() {
  const featured = await getFeaturedTemplates();
  const bySlug = new Map(featured.map((f) => [f.category.slug, f.template]));

  // Every garment on the homepage draws from the curated editorial palette
  // (see garmentColors.ts) rather than a template's stored `colors` list,
  // which can include leftover neon/high-saturation options from the old
  // dark theme that clash against the new warm ivory direction. `hexOverride`
  // remains for the rare case a specific instance wants to deviate.
  const toPreview = (slug: string, hexOverride?: string) => {
    const template = bySlug.get(slug);
    if (!template) return null;
    return {
      canvasJson: template.canvas_json,
      hex: hexOverride ?? EDITORIAL_GARMENT_COLORS[slug] ?? "#EDEADF",
      side: (template.print_area === "back" ? "back" : "front") as "front" | "back",
      label: template.name,
    };
  };

  const howItWorksPreview = toPreview("minimal");
  const designYourWayPreview = toPreview("couples");
  const businessUniform = toPreview("business");

  const makeItYoursExamples = MAKE_IT_YOURS_EXAMPLES.map(({ slug, caption }) => {
    const preview = toPreview(slug);
    return preview ? { ...preview, caption } : null;
  }).filter((example): example is NonNullable<typeof example> => example !== null);

  // Always [] today -- see FreshOffThePress.tsx for why -- but wired through
  // a real (currently-empty) data source rather than hardcoded, so plugging
  // in the real opt-in submissions later is a one-line change here.
  const realSubmissions: CustomerSubmission[] = [];
  const freshOffThePressFallback = FRESH_OFF_THE_PRESS_FALLBACK.map(({ slug }) => {
    const preview = toPreview(slug);
    return preview ? { ...preview, designName: preview.label } : null;
  }).filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <div className="theme-editorial bg-background text-foreground">
      <GrainOverlay />
      <SiteHeader />
      <main className="flex-1 overflow-x-hidden">
        <Hero />
        <WhatIsStitch />
        {designYourWayPreview && <DesignYourWay preview={designYourWayPreview} />}
        {makeItYoursExamples.length > 0 && <MakeItYours examples={makeItYoursExamples} />}
        <DesignLibrarySection />
        <HowItWorks preview={howItWorksPreview} />
        <FreshOffThePress submissions={realSubmissions} fallback={freshOffThePressFallback} />
        {businessUniform && <BusinessSection uniform={businessUniform} />}
        <ValueProps />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
