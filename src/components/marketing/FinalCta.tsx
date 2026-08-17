"use client";

import { motion, useReducedMotion } from "motion/react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { MagneticButton } from "@/components/marketing/MagneticButton";
import { BRAND_NAME } from "@/lib/brand";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Real graffiti-library marks converging inward from the four corners
 * toward the CTA -- the page's closing gesture, echoing the Hero's opening
 * one (artwork gathering around a focal point) but pulling toward the
 * button instead of a garment. */
const CONVERGING_MARKS: { path: string; corner: string; width: string; rotate: number; from: { x: number; y: number } }[] = [
  { path: "/assets/designs/graffiti/spray-paint-star.svg", corner: "left-[6%] top-[12%]", width: "7%", rotate: -14, from: { x: -60, y: -50 } },
  { path: "/assets/designs/graffiti/scribble-burst.svg", corner: "right-[8%] top-[16%]", width: "6%", rotate: 10, from: { x: 60, y: -50 } },
  { path: "/assets/designs/graffiti/paint-drip.svg", corner: "left-[10%] bottom-[14%]", width: "6%", rotate: -6, from: { x: -60, y: 50 } },
  { path: "/assets/designs/graffiti/street-lightning.svg", corner: "right-[6%] bottom-[10%]", width: "6%", rotate: 8, from: { x: 60, y: 50 } },
];

export function FinalCta() {
  const reduceMotion = useReducedMotion();

  return (
    <Section tone="raised" className="relative overflow-hidden">
      <motion.span
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-0 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap font-display text-[22vw] leading-none text-foreground/[0.05] md:text-[14vw]"
        initial={reduceMotion ? false : { scale: 1.4, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.1, ease: EASE }}
      >
        {BRAND_NAME}
      </motion.span>

      {CONVERGING_MARKS.map((mark) => (
        <motion.img
          key={mark.path}
          src={mark.path}
          alt=""
          aria-hidden
          className={`pointer-events-none absolute h-auto text-foreground/40 ${mark.corner}`}
          style={{ width: mark.width }}
          initial={reduceMotion ? { opacity: 0.5, rotate: mark.rotate } : { opacity: 0, x: mark.from.x, y: mark.from.y, rotate: mark.rotate * 3, scale: 0.4 }}
          whileInView={{ opacity: 0.5, x: 0, y: 0, rotate: mark.rotate, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: EASE }}
        />
      ))}

      <Container>
        <motion.div
          className="relative flex flex-col items-center gap-6 text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, delay: reduceMotion ? 0 : 0.2, ease: EASE }}
        >
          <h2 className="font-display text-display-xl text-foreground">
            Ready to wear <span className="italic">your idea</span>?
          </h2>
          <p className="max-w-md text-body-lg text-muted">
            The editor is free to use. You only pay when you order.
          </p>
          <MagneticButton
            href="/products"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-6 text-body font-medium text-accent-foreground uppercase tracking-wide text-body-sm font-semibold transition-colors hover:bg-accent/90"
          >
            Start designing
          </MagneticButton>
        </motion.div>
      </Container>
    </Section>
  );
}
