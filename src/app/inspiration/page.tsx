import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { InspirationGrid } from "@/components/marketing/InspirationGrid";
import { getFeaturedTemplates } from "@/lib/templates/queries";

export default async function InspirationPage() {
  const featured = await getFeaturedTemplates();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Section>
          <Container>
            <h1 className="font-display text-display-xl uppercase text-foreground">
              Inspiration
            </h1>
            <p className="mt-3 max-w-md text-body-lg text-muted">
              Browse designs by category, then make one yours in the editor.
            </p>
            <div className="mt-12">
              <InspirationGrid featured={featured} />
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
