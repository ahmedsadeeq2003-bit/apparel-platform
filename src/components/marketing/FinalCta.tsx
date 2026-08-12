import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

export function FinalCta() {
  return (
    <Section tone="raised">
      <Container>
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="font-display text-display-xl uppercase text-foreground">
            Your design. Your shirt.
          </h2>
          <p className="max-w-md text-body-lg text-muted">
            The editor is free to use. You only pay when you order.
          </p>
          <Button href="/signup" variant="primary">
            Start designing
          </Button>
        </div>
      </Container>
    </Section>
  );
}
