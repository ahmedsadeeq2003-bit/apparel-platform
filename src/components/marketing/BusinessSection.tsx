"use client";

import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { TemplatePreview } from "@/components/apparel/TemplatePreview";

const TEAM_SIZE = 5;

export function BusinessSection({
  uniform,
}: {
  uniform: { canvasJson: object; hex: string; side: "front" | "back" };
}) {
  const reduceMotion = useReducedMotion();

  return (
    <Section id="business" tone="raised">
      <Container>
        <div className="grid gap-12 md:grid-cols-2 md:items-center">
          <div className="flex flex-col gap-6">
            <h2 className="font-display text-display-xl uppercase text-foreground">
              Custom uniforms for your team.
            </h2>
            <p className="max-w-md text-body-lg text-muted">
              From a team of five to an entire organization, create branded
              uniforms that look consistent, professional, and unmistakably
              yours.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-4">
              <Button href="/products" variant="primary">
                Design for your team
              </Button>
              <span className="text-body-sm text-muted">Request bulk order</span>
            </div>
          </div>
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-3 gap-3 sm:grid-cols-5"
          >
            {Array.from({ length: TEAM_SIZE }).map((_, index) => (
              <TemplatePreview
                key={index}
                canvasJson={uniform.canvasJson}
                hex={uniform.hex}
                side={uniform.side}
                label="Team uniform shirt"
                className={index >= 3 ? "hidden sm:block" : ""}
              />
            ))}
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
