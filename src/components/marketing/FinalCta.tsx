"use client";

import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { BRAND_NAME } from "@/lib/brand";

export function FinalCta() {
  const reduceMotion = useReducedMotion();

  return (
    <Section tone="raised" className="relative overflow-hidden">
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-0 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-display text-[22vw] uppercase leading-none text-foreground/[0.04] md:text-[14vw]"
      >
        {BRAND_NAME}
      </span>
      <Container>
        <motion.div
          className="relative flex flex-col items-center gap-6 text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="font-display text-display-xl uppercase text-foreground">
            Stop wearing ordinary.
          </h2>
          <p className="max-w-md text-body-lg text-muted">
            The editor is free to use. You only pay when you order.
          </p>
          <Button href="/products" variant="primary">
            Start designing
          </Button>
        </motion.div>
      </Container>
    </Section>
  );
}
