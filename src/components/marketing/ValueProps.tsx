"use client";

import { motion, useReducedMotion } from "motion/react";
import { DownloadSimple, ShieldCheck, Truck } from "@phosphor-icons/react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

const ITEMS = [
  {
    icon: DownloadSimple,
    title: "Free high-res download",
    description: "Export your design as a print-ready PNG, no charge.",
  },
  {
    icon: ShieldCheck,
    title: "Every order, quality-checked",
    description: "We review print quality before it goes to our print partner.",
  },
  {
    icon: Truck,
    title: "One flat delivery fee",
    description: "No zones, no surprise charges. Same fee wherever you are.",
  },
] as const;

export function ValueProps() {
  const reduceMotion = useReducedMotion();

  return (
    <Section className="border-y border-border">
      <Container>
        <div className="grid gap-10 sm:grid-cols-3">
          {ITEMS.map(({ icon: Icon, title, description }, index) => (
            <motion.div
              key={title}
              className="flex flex-col gap-3"
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <Icon className="h-6 w-6 text-accent" weight="duotone" aria-hidden />
              <h3 className="text-body-lg font-semibold text-foreground">{title}</h3>
              <p className="text-body-sm text-muted">{description}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
