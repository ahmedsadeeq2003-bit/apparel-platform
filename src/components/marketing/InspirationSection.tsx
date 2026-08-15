import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { InspirationGrid } from "@/components/marketing/InspirationGrid";
import { getFeaturedTemplates } from "@/lib/templates/queries";

export async function InspirationSection() {
  const featured = await getFeaturedTemplates();

  if (featured.length === 0) {
    return null;
  }

  return (
    <Section tone="raised">
      <Container>
        <h2 className="font-display text-display-xl uppercase text-foreground">
          The design gallery.
        </h2>
        <p className="mt-3 max-w-md text-body text-muted">
          A curated look at what people make here, not a catalog to shop.
          Borrow an idea, then make it yours in the editor.
        </p>
        <div className="mt-12">
          <InspirationGrid featured={featured} />
        </div>
      </Container>
    </Section>
  );
}
