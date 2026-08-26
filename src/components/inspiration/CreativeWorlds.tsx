"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowDown } from "@phosphor-icons/react";
import { Container } from "@/components/layout/Container";

const EASE = [0.16, 1, 0.3, 1] as const;

type World = {
  index: string;
  eyebrow: string;
  title: string;
  copy: string;
  href: string;
  rotate: number;
};

const WORLDS: World[] = [
  {
    index: "01",
    eyebrow: "Artwork",
    title: "Build from a single idea.",
    copy: "Individual graphics you can place, resize and recolor on a blank shirt.",
    href: "#artwork",
    rotate: -1.5,
  },
  {
    index: "02",
    eyebrow: "Templates",
    title: "Start with a complete thought.",
    copy: "Ready-made compositions from the STITCH library, yours to customize.",
    href: "#templates",
    rotate: 1,
  },
  {
    index: "03",
    eyebrow: "Customer designs",
    title: "See what others made.",
    copy: "Real STITCH customer work, shown here the moment it exists.",
    href: "#customer-designs",
    rotate: -1,
  },
];

const CONTAINER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

function cardVariants(rotate: number): Variants {
  return {
    hidden: { opacity: 0, y: 40, rotate: 0 },
    show: { opacity: 1, y: 0, rotate, transition: { duration: 0.6, ease: EASE } },
  };
}

/**
 * The three discovery paths, presented as oversized editorial index cards
 * (not a conventional icon+heading three-column feature grid) -- each one
 * a slightly rotated slab of typography that straightens and lifts on
 * hover, anchor-linking down to its own section below rather than
 * navigating away. The rotation values are deliberately small and
 * alternating, not identical, so the row reads as loosely arranged rather
 * than mechanically repeated.
 */
export function CreativeWorlds() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="py-section">
      <Container>
        <motion.div
          initial={reduceMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={CONTAINER}
          className="grid gap-6 md:grid-cols-3"
        >
          {WORLDS.map((world) => (
            <motion.div key={world.index} variants={cardVariants(world.rotate)}>
              <Link
                href={world.href}
                className="group relative flex h-full flex-col justify-between gap-10 overflow-hidden rounded-sm border border-border bg-surface p-8 transition-colors hover:border-accent"
              >
                <span className="font-display text-display-md text-foreground/15 transition-colors group-hover:text-accent/25">
                  {world.index}
                </span>
                <div className="flex flex-col gap-3">
                  <span className="text-label font-semibold uppercase tracking-[0.18em] text-accent">
                    {world.eyebrow}
                  </span>
                  <h3 className="font-display text-display-md text-foreground">{world.title}</h3>
                  <p className="text-body text-muted">{world.copy}</p>
                </div>
                <span className="inline-flex items-center gap-2 text-body-sm font-medium text-foreground transition-transform duration-300 group-hover:translate-y-1">
                  Explore
                  <ArrowDown size={14} weight="bold" aria-hidden />
                </span>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
