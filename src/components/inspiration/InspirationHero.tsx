"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { Container } from "@/components/layout/Container";

const EASE = [0.16, 1, 0.3, 1] as const;
const OVERSHOOT = [0.34, 1.56, 0.64, 1] as const;

type HeadlineLine = { text: string; italic?: boolean };

const HEADLINE: HeadlineLine[] = [{ text: "See it." }, { text: "Make it.", italic: true }];

const LINE_CONTAINER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
};

function lineVariants(index: number): Variants {
  return {
    hidden: { opacity: 0, y: 34, rotate: index === 0 ? -2 : 2 },
    show: { opacity: 1, y: 0, rotate: 0, transition: { duration: 0.7, ease: EASE } },
  };
}

/** Real STITCH library pieces (see public/assets/designs/), a different set
 * than the homepage Hero uses -- these fly in and settle around the
 * headline, then drift gently in place, distinct per-piece speed/rotation
 * so it reads as several independent objects rather than one group
 * animation. */
type Mark = {
  path: string;
  className: string;
  rotate: number;
  opacity: number;
  from: { x: number; y: number; rotate: number; scale: number };
  delay: number;
  floatDuration: number;
};

const MARKS: Mark[] = [
  {
    path: "/assets/designs/graffiti/spray-paint-star.svg",
    className: "left-[4%] top-[8%] w-[9%] lg:w-[7%]",
    rotate: -10,
    opacity: 0.9,
    from: { x: -80, y: -50, rotate: -50, scale: 0.4 },
    delay: 0.5,
    floatDuration: 4.2,
  },
  {
    path: "/assets/designs/illustration/vintage-camera.svg",
    className: "right-[6%] top-[4%] w-[11%] lg:w-[8%]",
    rotate: 8,
    opacity: 0.55,
    from: { x: 90, y: -40, rotate: 40, scale: 0.4 },
    delay: 0.65,
    floatDuration: 4.8,
  },
  {
    path: "/assets/designs/abstract/kinetic-lines.svg",
    className: "left-[2%] bottom-[10%] w-[13%] lg:w-[10%]",
    rotate: -6,
    opacity: 0.6,
    from: { x: -100, y: 60, rotate: -35, scale: 0.4 },
    delay: 0.8,
    floatDuration: 5.4,
  },
  {
    path: "/assets/designs/graphic-art/retro-sun.svg",
    className: "right-[8%] bottom-[6%] w-[10%] lg:w-[7%]",
    rotate: 5,
    opacity: 0.8,
    from: { x: 90, y: 70, rotate: 45, scale: 0.4 },
    delay: 0.95,
    floatDuration: 5,
  },
  {
    path: "/assets/designs/minimal/tiny-star.svg",
    className: "left-[26%] top-[2%] w-[5%] lg:w-[4%]",
    rotate: 0,
    opacity: 0.7,
    from: { x: 0, y: -60, rotate: -20, scale: 0.3 },
    delay: 1.1,
    floatDuration: 3.6,
  },
  {
    path: "/assets/designs/typography/no-signal.svg",
    className: "right-[22%] bottom-[2%] w-[13%] lg:w-[10%]",
    rotate: -4,
    opacity: 0.5,
    from: { x: 40, y: 80, rotate: 20, scale: 0.4 },
    delay: 1.25,
    floatDuration: 4.6,
  },
];

function AtmosphereBackground() {
  const reduceMotion = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(110% 85% at 22% 15%, color-mix(in oklab, var(--color-accent) 14%, transparent) 0%, transparent 55%), linear-gradient(170deg, color-mix(in oklab, var(--color-surface) 55%, white) 0%, var(--color-background) 55%, var(--color-surface) 100%)",
        }}
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      />
      <motion.span
        className="absolute left-1/2 top-[6%] -translate-x-1/2 select-none whitespace-nowrap font-display text-[22vw] leading-none text-foreground/[0.035] md:text-[13vw]"
        initial={reduceMotion ? false : { opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.3, ease: EASE }}
      >
        INSPIRATION
      </motion.span>
    </div>
  );
}

/**
 * The Inspiration page's own opening beat -- oversized italic-accented
 * headline (same construction idea as the homepage Hero: plain line, then
 * an italic line with its own entrance) with real library artwork layered
 * around it rather than staged on a garment (there's no single product this
 * page is about -- the point here is the art itself). Marks fly in once,
 * then drift continuously at their own independent speed, distinct from
 * both the homepage Hero (garment-centered) and ProductsHero (no artwork at
 * all) so this page has its own visual identity while sharing the same
 * motion language (EASE/OVERSHOOT, ScribbleUnderline-style restraint).
 */
export function InspirationHero() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden pb-8 pt-16 md:pt-24">
      <AtmosphereBackground />

      {!reduceMotion &&
        MARKS.map((mark) => (
          <motion.div
            key={mark.path}
            className={`pointer-events-none absolute z-0 ${mark.className}`}
            animate={{ y: [0, -10, 0], rotate: [mark.rotate, mark.rotate + 3, mark.rotate] }}
            transition={{ duration: mark.floatDuration, repeat: Infinity, ease: "easeInOut", delay: mark.delay + 1 }}
          >
            <motion.img
              src={mark.path}
              alt=""
              aria-hidden
              className="h-auto w-full text-foreground"
              initial={{ opacity: 0, x: mark.from.x, y: mark.from.y, rotate: mark.from.rotate, scale: mark.from.scale }}
              animate={{ opacity: mark.opacity, x: 0, y: 0, rotate: mark.rotate, scale: 1 }}
              transition={{ duration: 0.85, delay: mark.delay, ease: OVERSHOOT }}
            />
          </motion.div>
        ))}

      <Container>
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <motion.span
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="text-label font-semibold uppercase tracking-[0.18em] text-accent"
          >
            The Inspiration studio
          </motion.span>

          <h1 className="mt-4 font-display text-display-2xl text-foreground">
            <motion.div initial={reduceMotion ? false : "hidden"} animate="show" variants={LINE_CONTAINER}>
              {HEADLINE.map((line, index) => (
                <motion.span
                  key={line.text}
                  className={`block ${line.italic ? "italic" : ""}`}
                  variants={lineVariants(index)}
                >
                  {line.text}
                </motion.span>
              ))}
            </motion.div>
          </h1>

          <motion.p
            className="mx-auto mt-6 max-w-md text-body-lg text-muted"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.55, ease: EASE }}
          >
            Explore artwork, templates and designs made to spark your next
            one.
          </motion.p>
        </div>
      </Container>
    </section>
  );
}
