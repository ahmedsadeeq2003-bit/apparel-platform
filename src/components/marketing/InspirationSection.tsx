import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { InspirationGrid } from "@/components/marketing/InspirationGrid";
import { SpraySplatter } from "@/components/marketing/GraffitiMark";
import { getFeaturedTemplates } from "@/lib/templates/queries";

export async function InspirationSection() {
  const featured = await getFeaturedTemplates();

  if (featured.length === 0) {
    return null;
  }

  return (
    <Section className="relative overflow-hidden">
      <SpraySplatter className="pointer-events-none absolute -right-6 top-8 -z-0 h-24 w-24 text-accent/20 md:h-32 md:w-32" />
      <Container>
        <h2 className="relative font-display text-display-xl uppercase text-foreground">
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
