"use client";

import { motion, useReducedMotion } from "motion/react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

const STEPS = [
  {
    number: "1",
    title: "Create",
    description: "Start from a blank shirt or a gallery template.",
  },
  {
    number: "2",
    title: "Customize",
    description: "Add text, artwork or photos, in any color.",
  },
  {
    number: "3",
    title: "Preview",
    description: "See exactly how your design looks on the shirt.",
  },
  {
    number: "4",
    title: "Print",
    description: "Choose your size and quantity, then order.",
  },
  {
    number: "5",
    title: "Deliver",
    description: "We produce your shirt and get it to your door.",
  },
] as const;

const OFFSETS = ["", "md:mt-6", "md:mt-12", "md:mt-16", "md:mt-24"] as const;

export function HowItWorks() {
  const reduceMotion = useReducedMotion();

  return (
    <Section id="how-it-works" tone="raised">
      <Container>
        <h2 className="font-display text-display-xl uppercase text-foreground">
          How it works
        </h2>
        <div className="mt-12 grid gap-10 md:grid-cols-5 md:gap-6">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.number}
              className={OFFSETS[index]}
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center gap-4">
                <span className="font-display text-display-md text-accent">
                  {step.number}
                </span>
                <span className="relative h-px flex-1 overflow-hidden bg-border">
                  <motion.span
                    className="absolute inset-y-0 left-0 bg-accent"
                    initial={reduceMotion ? false : { width: 0 }}
                    whileInView={{ width: "100%" }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.8, delay: index * 0.1 + 0.2, ease: [0.16, 1, 0.3, 1] }}
                  />
                </span>
              </div>
              <h3 className="mt-4 text-body-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-body text-muted">{step.description}</p>
            </motion.div>
          ))}
        </div>
        <p className="mt-16 text-body-sm text-muted">
          Just want the design? The editor is free to use, with no order
          required.
        </p>
      </Container>
    </Section>
  );
}
