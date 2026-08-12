import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

export function ValueProps() {
  return (
    <Section>
      <Container>
        <h2 className="font-display text-display-xl uppercase text-foreground">
          Everything you need, nothing you don&apos;t
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-rows-3 md:[grid-template-columns:repeat(4,1fr)]">
          <div className="rounded-sm border border-border bg-surface p-8 md:col-span-2 md:row-span-2 md:col-start-1 md:row-start-1">
            <h3 className="font-display text-display-md uppercase text-foreground">
              Front &amp; back, fully custom
            </h3>
            <p className="mt-3 max-w-sm text-body text-muted">
              Add text, upload your own art or photos, and place it exactly
              where you want on either side of the shirt.
            </p>
          </div>

          <div className="rounded-sm border border-border bg-surface p-6 md:col-start-3 md:row-start-1">
            <h3 className="text-body-lg font-semibold text-foreground">
              See it before you buy
            </h3>
            <p className="mt-2 text-body-sm text-muted">
              A color-accurate mockup updates live as you design.
            </p>
          </div>

          <div className="rounded-sm border border-border bg-surface p-6 md:col-start-4 md:row-start-1">
            <h3 className="text-body-lg font-semibold text-foreground">
              Free high-res download
            </h3>
            <p className="mt-2 text-body-sm text-muted">
              Export your design as a print-ready PNG, no charge.
            </p>
          </div>

          <div className="rounded-sm border border-border bg-surface p-6 md:col-span-2 md:col-start-3 md:row-start-2">
            <h3 className="text-body-lg font-semibold text-foreground">
              Every order, quality-checked
            </h3>
            <p className="mt-2 text-body-sm text-muted">
              We review your design for print quality before it goes to our
              print partner.
            </p>
          </div>

          <div className="rounded-sm border border-border bg-surface p-8 md:col-span-4 md:col-start-1 md:row-start-3">
            <h3 className="font-display text-display-md uppercase text-foreground">
              One flat delivery fee
            </h3>
            <p className="mt-2 max-w-md text-body text-muted">
              No zones, no surprise charges at checkout — the delivery fee is
              the same wherever you are.
            </p>
          </div>
        </div>
      </Container>
    </Section>
  );
}
