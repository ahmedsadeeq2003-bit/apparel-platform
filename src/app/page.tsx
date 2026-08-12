import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Hero } from "@/components/marketing/Hero";
import { InspirationSection } from "@/components/marketing/InspirationSection";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { ValueProps } from "@/components/marketing/ValueProps";
import { FinalCta } from "@/components/marketing/FinalCta";
import { GrainOverlay } from "@/components/marketing/GrainOverlay";

export default function Home() {
  return (
    <>
      <GrainOverlay />
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <InspirationSection />
        <HowItWorks />
        <ValueProps />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
