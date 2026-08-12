import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { ValueProps } from "@/components/marketing/ValueProps";
import { FinalCta } from "@/components/marketing/FinalCta";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <ValueProps />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
