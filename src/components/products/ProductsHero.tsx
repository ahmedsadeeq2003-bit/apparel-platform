"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { Container } from "@/components/layout/Container";
import { ScribbleUnderline } from "@/components/marketing/EditorialMarks";

const EASE = [0.16, 1, 0.3, 1] as const;

const STEPS = ["Choose your garment", "Pick your color", "Start designing", "Add it to your cart"] as const;

const STEP_CONTAINER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.55 } },
};

const STEP_ITEM: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.92 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: EASE } },
};

/**
 * The Products page's own opening beat -- distinct from the homepage Hero
 * (no garment staged here; the real garment is the showcase card right
 * below) but built from the same motion vocabulary (EASE, staggered
 * reveals, ScribbleUnderline) so the page reads as a continuation of the
 * homepage rather than a different product. The four-step strip makes the
 * DISCOVER -> CHOOSE -> CREATE -> CART narrative explicit without building
 * any of step 4's actual cart UI here -- that already exists in the editor's
 * AddToCartDialog once a design exists, which this page deliberately leads
 * toward rather than duplicates.
 */
export function ProductsHero() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative overflow-hidden pb-4 pt-16 md:pt-24">
      <Container>
        <motion.span
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="text-label font-semibold uppercase tracking-[0.18em] text-accent"
        >
          Discover &middot; Choose &middot; Create
        </motion.span>

        <h1 className="mt-4 max-w-2xl font-display text-display-2xl text-foreground">
          <motion.span
            className="block"
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: reduceMotion ? 0 : 0.12, ease: EASE }}
          >
            Your blank
          </motion.span>
          <motion.span
            className="relative inline-block italic"
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: reduceMotion ? 0 : 0.24, ease: EASE }}
          >
            canvas.
            <ScribbleUnderline className="absolute -bottom-2 left-0 h-3 w-full text-accent" />
          </motion.span>
        </h1>

        <motion.p
          className="mt-6 max-w-md text-body-lg text-muted"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.38, ease: EASE }}
        >
          One real garment. Four honest colors. Pick a color below, then take
          it into the studio and make it yours.
        </motion.p>

        <motion.ol
          className="mt-10 flex flex-wrap items-center gap-x-3 gap-y-2"
          initial={reduceMotion ? false : "hidden"}
          animate="show"
          variants={STEP_CONTAINER}
        >
          {STEPS.map((step, index) => (
            <motion.li key={step} className="flex items-center gap-3" variants={STEP_ITEM}>
              <span className="flex items-center gap-2 text-body-sm font-medium text-foreground">
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border text-[0.65rem] text-muted">
                  {index + 1}
                </span>
                {step}
              </span>
              {index < STEPS.length - 1 && (
                <span aria-hidden className="text-body-sm text-accent">
                  &rarr;
                </span>
              )}
            </motion.li>
          ))}
        </motion.ol>
      </Container>
    </div>
  );
}
