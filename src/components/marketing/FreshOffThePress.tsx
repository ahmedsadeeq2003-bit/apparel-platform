"use client";

import { motion, useReducedMotion } from "motion/react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { CampaignGarment } from "@/components/apparel/CampaignGarment";

/** A design a customer opted in to share at checkout ("Show my design in
 * Fresh Off the Press"). Deliberately has no name/photo field -- this
 * section shows the design, never the person, since no opt-in identity
 * capture exists yet and none should be invented. Checkout doesn't write
 * these yet, so `submissions` is always [] for now; the empty-state
 * fallback below stands in until it does. */
export type CustomerSubmission = {
  id: string;
  canvasJson: object;
  hex: string;
  side: "front" | "back";
  designName: string;
};

const ROTATIONS = ["-3deg", "2deg", "-2deg", "3deg"] as const;

export function FreshOffThePress({
  submissions,
  fallback,
}: {
  submissions: CustomerSubmission[];
  fallback: { canvasJson: object; hex: string; side: "front" | "back"; label: string; designName: string }[];
}) {
  const reduceMotion = useReducedMotion();
  const showingReal = submissions.length > 0;
  const items = showingReal ? submissions : fallback;

  if (items.length === 0) return null;

  return (
    <Section>
      <Container>
        <div>
          <span className="text-label font-semibold uppercase tracking-[0.18em] text-muted">
            Fresh off the press
          </span>
          <h2 className="mt-3 font-display text-display-xl text-foreground">
            Made by STITCH Customers
          </h2>
          <p className="mt-2 max-w-md text-body-lg text-muted">
            {showingReal
              ? "Real designs, shared by the people who made them."
              : "Customers will soon be able to share their finished designs here. Until then, here's a taste from the STITCH library."}
          </p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-14 md:grid-cols-4">
          {items.slice(0, 4).map((item, index) => (
            <motion.div
              key={"id" in item ? item.id : item.designName}
              className="flex flex-col items-center gap-3"
              initial={reduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <CampaignGarment
                canvasJson={item.canvasJson}
                hex={item.hex}
                side={item.side}
                label={item.designName}
                className="w-full max-w-[180px]"
                style={{ transform: `rotate(${ROTATIONS[index % ROTATIONS.length]})` }}
                shadowIntensity={0.8}
              />
              <div className="flex flex-col items-center gap-1 text-center">
                <p className="text-body-sm font-medium text-foreground">{item.designName}</p>
                {!showingReal && (
                  <span className="text-[0.65rem] font-medium uppercase tracking-[0.08em] text-muted">
                    From the STITCH library
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
