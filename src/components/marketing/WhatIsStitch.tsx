"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { ScribbleUnderline } from "@/components/marketing/EditorialMarks";

const EASE = [0.16, 1, 0.3, 1] as const;
const LOOP = ["Discover", "Design", "Customize", "Order"] as const;

/** Short, typography-led explainer -- a deliberate change of rhythm after
 * the Hero's dense garment composition, and the one place on the page that
 * states outright what STITCH is (a design studio, not a marketplace)
 * before the rest of the page shows it. Its own motion language is
 * horizontal: the two headline lines slide in from opposite edges and meet
 * in the middle, and a real graffiti mark drifts across the whole section
 * as the reader scrolls past, tied to scroll position rather than a
 * one-shot entrance -- distinct from the Hero's converge-and-settle and
 * from the sibling sections' vertical reveals. */
export function WhatIsStitch() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const markX = useTransform(scrollYProgress, [0, 1], ["-15vw", "115vw"]);
  const markRotate = useTransform(scrollYProgress, [0, 1], [-20, 35]);

  return (
    <Section className="relative overflow-hidden" id="what-is-stitch">
      <div ref={sectionRef} className="absolute inset-0" aria-hidden />
      {!reduceMotion && (
        <motion.img
          src="/assets/designs/abstract/abstract-loop.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute top-[88%] h-auto w-[16vw] max-w-48 -translate-y-1/2 opacity-[0.14]"
          style={{ left: markX, rotate: markRotate }}
        />
      )}
      <Container>
        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <motion.span
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="text-label font-semibold uppercase tracking-[0.18em] text-muted"
          >
            What is STITCH?
          </motion.span>
          <h2 className="font-display text-display-xl text-foreground">
            <motion.span
              className="block"
              initial={reduceMotion ? false : { opacity: 0, x: "-40%" }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8, ease: EASE }}
            >
              A design studio for your own T-shirts
            </motion.span>
            <motion.span
              className="relative inline-block"
              initial={reduceMotion ? false : { opacity: 0, x: "40%" }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8, delay: reduceMotion ? 0 : 0.12, ease: EASE }}
            >
              not a marketplace.
              <ScribbleUnderline className="absolute -bottom-2 left-0 h-3 w-full text-accent" />
            </motion.span>
          </h2>
          <motion.p
            className="max-w-md text-body-lg text-muted"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.25, ease: EASE }}
          >
            There is nothing to browse and buy off a shelf. Pick a blank
            garment, make it yours with real artwork, your own upload, or
            your own words, then we print and ship the exact thing you made.
          </motion.p>
          <motion.div
            className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-2"
            initial={reduceMotion ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, amount: 0.5 }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.4 } } }}
          >
            {LOOP.map((step, index) => (
              <motion.span
                key={step}
                className="flex items-center gap-3"
                variants={{ hidden: { opacity: 0, y: 10, scale: 0.9 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: EASE } } }}
              >
                <span className="text-body-sm font-semibold uppercase tracking-[0.1em] text-foreground">
                  {step}
                </span>
                {index < LOOP.length - 1 && (
                  <span aria-hidden className="text-body-sm text-accent">
                    &rarr;
                  </span>
                )}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
