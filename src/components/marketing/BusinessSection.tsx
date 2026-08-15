"use client";

import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { CampaignGarment } from "@/components/apparel/CampaignGarment";

const TEAM_SIZE = 5;
const ROTATIONS = ["-4deg", "2deg", "0deg", "-2deg", "4deg"] as const;
const LIFTS = ["0.5rem", "0rem", "-0.75rem", "0rem", "0.5rem"] as const;

export function BusinessSection({
  uniform,
}: {
  uniform: { canvasJson: object; hex: string; side: "front" | "back" };
}) {
  const reduceMotion = useReducedMotion();

  return (
    <Section id="business" tone="raised">
      <Container>
        <div className="flex flex-col gap-6 md:max-w-xl">
          <h2 className="font-display text-display-xl uppercase text-foreground">
            Custom uniforms for your team.
          </h2>
          <p className="text-body-lg text-muted">
            From a team of five to an entire organization, create branded
            uniforms that look consistent, professional, and unmistakably
            yours.
          </p>
          <div className="flex flex-wrap items-center gap-4">
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
          className="mt-14 flex items-end justify-center gap-2 sm:gap-4"
        >
          {Array.from({ length: TEAM_SIZE }).map((_, index) => (
            <CampaignGarment
              key={index}
              canvasJson={uniform.canvasJson}
              hex={uniform.hex}
              side={uniform.side}
              label="Team uniform shirt"
              className={`w-[30%] max-w-[190px] ${index >= 3 ? "hidden sm:block" : ""}`}
              style={{ transform: `rotate(${ROTATIONS[index]}) translateY(${LIFTS[index]})` }}
              shadowIntensity={0.9}
            />
          ))}
        </motion.div>
      </Container>
    </Section>
  );
}
