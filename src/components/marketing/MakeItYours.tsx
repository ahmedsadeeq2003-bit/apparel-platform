"use client";

import { motion, useReducedMotion } from "motion/react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { CampaignGarment } from "@/components/apparel/CampaignGarment";

type Example = {
  canvasJson: object;
  hex: string;
  side: "front" | "back";
  label: string;
  caption: string;
};

const ROTATIONS = ["-3deg", "2deg", "-2deg", "3deg"] as const;

export function MakeItYours({ examples }: { examples: Example[] }) {
  const reduceMotion = useReducedMotion();

  return (
    <Section>
      <Container>
        <h2 className="font-display text-display-xl uppercase text-foreground">
          Make it yours.
        </h2>
        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-4">
          {examples.map((example, index) => (
            <motion.div
              key={example.label}
              className="flex flex-col items-center gap-4"
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <CampaignGarment
                canvasJson={example.canvasJson}
                hex={example.hex}
                side={example.side}
                label={example.label}
                className="w-full max-w-[180px]"
                style={{ transform: `rotate(${ROTATIONS[index % ROTATIONS.length]})` }}
                shadowIntensity={0.8}
              />
              <p className="text-center text-body-sm text-muted">{example.caption}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
