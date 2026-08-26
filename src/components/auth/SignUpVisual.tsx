"use client";

import { motion, useReducedMotion } from "motion/react";
import { GrainOverlay } from "@/components/marketing/GrainOverlay";
import { ScribbleUnderline, MarkerTag } from "@/components/marketing/EditorialMarks";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Real STITCH artwork fragments (see public/assets/designs/), not new
 * SVGs made for this page -- a graffiti mark, an abstract shape, and one
 * typography piece, drifting gently in place. Deliberately restrained: a
 * handful of pieces, not a wall. */
const FRAGMENTS: { path: string; className: string; delay: number }[] = [
  { path: "/assets/designs/graffiti/hand-drawn-crown.svg", className: "left-[3%] top-[3%] w-[11%]", delay: 0.5 },
  { path: "/assets/designs/abstract/abstract-loop.svg", className: "right-[10%] top-[22%] w-[10%] opacity-60", delay: 0.65 },
  { path: "/assets/designs/graffiti/scribble-burst.svg", className: "left-[14%] bottom-[16%] w-[9%] opacity-50", delay: 0.8 },
  { path: "/assets/designs/typography/good-energy.svg", className: "right-[8%] bottom-[10%] w-[20%] opacity-70", delay: 0.95 },
];

export function SignUpVisual() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-center lg:px-16 lg:py-16 xl:px-20">
      <GrainOverlay />
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(120% 90% at 20% 20%, color-mix(in oklab, var(--color-accent) 10%, transparent) 0%, transparent 55%), linear-gradient(160deg, color-mix(in oklab, var(--color-surface) 55%, white) 0%, var(--color-background) 55%, var(--color-surface) 100%)",
        }}
      />

      {FRAGMENTS.map((fragment) => (
        <motion.img
          key={fragment.path}
          src={fragment.path}
          alt=""
          aria-hidden
          className={`pointer-events-none absolute h-auto ${fragment.className}`}
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.7, rotate: -12 }}
          animate={
            reduceMotion
              ? { opacity: 1 }
              : { opacity: 1, scale: 1, rotate: 0, y: [0, -10, 0] }
          }
          transition={
            reduceMotion
              ? { duration: 0.4 }
              : {
                  opacity: { duration: 0.6, delay: fragment.delay, ease: EASE },
                  scale: { duration: 0.6, delay: fragment.delay, ease: EASE },
                  rotate: { duration: 0.6, delay: fragment.delay, ease: EASE },
                  y: { duration: 5, delay: fragment.delay + 0.6, repeat: Infinity, ease: "easeInOut" },
                }
          }
        />
      ))}

      <motion.div
        className="relative z-10 max-w-md"
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <span className="text-label font-semibold uppercase tracking-[0.18em] text-accent">
          Enter STITCH
        </span>
        <h1 className="mt-4 font-display text-display-2xl text-foreground">
          Make something
          <br />
          that feels
          <br />
          <span className="relative inline-block italic">
            like you.
            <ScribbleUnderline className="absolute -bottom-2 left-0 h-3 w-full text-accent" />
          </span>
        </h1>
        <p className="mt-6 max-w-sm text-body-lg text-muted">
          Tell us who you are, then start designing -- real artwork, your own
          uploads, your own words, on a real garment.
        </p>
        <MarkerTag rotate={-5} className="mt-8 inline-block">
          your first design is free to make.
        </MarkerTag>
      </motion.div>
    </div>
  );
}
