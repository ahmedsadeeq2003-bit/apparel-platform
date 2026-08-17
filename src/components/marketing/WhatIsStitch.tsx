"use client";

import { motion, useReducedMotion } from "motion/react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { ScribbleUnderline } from "@/components/marketing/EditorialMarks";

const LOOP = ["Discover", "Design", "Customize", "Order"] as const;

/** Short, typography-led explainer -- a deliberate change of rhythm after
 * the Hero's dense garment composition, and the one place on the page that
 * states outright what STITCH is (a design studio, not a marketplace) before
 * the rest of the page shows it. */
export function WhatIsStitch() {
  const reduceMotion = useReducedMotion();

  return (
    <Section>
      <Container>
        <motion.div
          className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="text-label font-semibold uppercase tracking-[0.18em] text-muted">
            What is STITCH?
          </span>
          <h2 className="font-display text-display-xl text-foreground">
            A design studio for your own T-shirts
            <br />
            <span className="relative inline-block">
              not a marketplace.
              <ScribbleUnderline className="absolute -bottom-2 left-0 h-3 w-full text-accent" />
            </span>
          </h2>
          <p className="max-w-md text-body-lg text-muted">
            There is nothing to browse and buy off a shelf. Pick a blank
            garment, make it yours with real artwork, your own upload, or
            your own words, then we print and ship the exact thing you made.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            {LOOP.map((step, index) => (
              <span key={step} className="flex items-center gap-3">
                <span className="text-body-sm font-semibold uppercase tracking-[0.1em] text-foreground">
                  {step}
                </span>
                {index < LOOP.length - 1 && (
                  <span aria-hidden className="text-body-sm text-accent">
                    &rarr;
                  </span>
                )}
              </span>
            ))}
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}
