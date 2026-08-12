import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

const STEPS = [
  {
    number: "1",
    title: "Design it",
    description:
      "Add text, upload art, pick a shirt color, and place it front or back in the editor.",
  },
  {
    number: "2",
    title: "We print it",
    description:
      "Your order goes to our print partner as soon as payment clears.",
  },
  {
    number: "3",
    title: "It ships",
    description:
      "Track your order's status from print to delivery on your account page.",
  },
] as const;

export function HowItWorks() {
  return (
    <Section id="how-it-works" tone="raised">
      <Container>
        <h2 className="font-display text-display-xl uppercase text-foreground">
          How it works
        </h2>
        <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((step, index) => (
            <div
              key={step.number}
              className={index === 1 ? "md:mt-10" : index === 2 ? "md:mt-20" : ""}
            >
              <div className="flex items-center gap-4">
                <span className="font-display text-display-md text-accent">
                  {step.number}
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <h3 className="mt-4 text-body-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-body text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
