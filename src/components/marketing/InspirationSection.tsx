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
    <Section>
      <Container>
        <h2 className="font-display text-display-xl uppercase text-foreground">
          Borrow the idea. Make it yours.
        </h2>
        <p className="mt-3 max-w-md text-body text-muted">
          Not sure what to design? Explore real designs across every style,
          then customize one in the editor. Not a designer? No problem.
        </p>
        <div className="mt-12">
          <InspirationGrid featured={featured} />
        </div>
      </Container>
    </Section>
  );
}
