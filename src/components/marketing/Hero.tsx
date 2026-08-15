"use client";

import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { TemplatePreview } from "@/components/apparel/TemplatePreview";
import { HalftoneBurst, ScribbleUnderline, SpraySplatter } from "@/components/marketing/GraffitiMark";

const CONTAINER_VARIANTS = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export type HeroShirt = {
  canvasJson: object;
  hex: string;
  side: "front" | "back";
  label: string;
};

/**
 * Layered collage slots -- deliberately overlapping for a pinned-to-the-wall
 * feel. Plain inline styles (not Tailwind arbitrary values): TemplatePreview's
 * own `aspect-square` class and a non-square w/h override are the same CSS
 * specificity, so the cascade order between them isn't reliable -- inline
 * styles always win, sidestepping that entirely.
 */
const COLLAGE_SLOTS: CSSProperties[] = [
  { position: "absolute", left: "0%", top: "0%", height: "46%", width: "46%", transform: "rotate(-6deg)" },
  { position: "absolute", right: "0%", top: "2%", height: "38%", width: "38%", transform: "rotate(6deg)" },
  { position: "absolute", left: "30%", top: "28%", height: "46%", width: "42%", transform: "rotate(2deg)", zIndex: 10 },
  { position: "absolute", left: "4%", bottom: "0%", height: "36%", width: "34%", transform: "rotate(6deg)" },
  { position: "absolute", right: "0%", bottom: "2%", height: "40%", width: "38%", transform: "rotate(-3deg)" },
];

export function Hero({ shirts }: { shirts: HeroShirt[] }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="min-h-[calc(92dvh-4rem)] md:min-h-[calc(92dvh-4.5rem)]">
      <Container>
        <div className="grid items-center gap-12 py-16 md:grid-cols-[1.05fr_0.95fr] md:py-24">
          <motion.div
            className="flex flex-col gap-6"
            initial={reduceMotion ? false : "hidden"}
            animate="show"
            variants={CONTAINER_VARIANTS}
          >
            <motion.h1
              variants={ITEM_VARIANTS}
              className="font-display text-display-2xl uppercase text-foreground"
            >
              Your idea.
              <br />
              <span className="relative inline-block">
                Your tee.
                <ScribbleUnderline className="absolute -bottom-3 left-0 h-4 w-full text-accent" />
              </span>
            </motion.h1>
            <motion.p variants={ITEM_VARIANTS} className="max-w-md text-body-lg text-muted">
              Create your own T-shirt with text, artwork, photos and
              graphics. Design it online, preview it instantly, then order
              it printed and delivered.
            </motion.p>
            <motion.div variants={ITEM_VARIANTS} className="flex flex-wrap gap-4 pt-2">
              <Button href="/products" variant="primary">
                Start designing
              </Button>
              <Button href="/inspiration" variant="secondary">
                Explore inspiration
              </Button>
            </motion.div>
          </motion.div>
          <motion.div
            className="relative"
            initial={reduceMotion ? false : { opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <HalftoneBurst className="pointer-events-none absolute -right-8 -top-8 -z-10 h-32 w-32 text-accent/70 md:h-44 md:w-44" />
            <SpraySplatter className="pointer-events-none absolute -bottom-10 -left-10 -z-10 h-28 w-28 text-accent/30 md:h-36 md:w-36" />
            <div className="relative aspect-[4/5] overflow-hidden">
              {shirts.map((shirt, index) => (
                <TemplatePreview
                  key={index}
                  canvasJson={shirt.canvasJson}
                  hex={shirt.hex}
                  side={shirt.side}
                  label={shirt.label}
                  className="shadow-2xl"
                  style={COLLAGE_SLOTS[index]}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </Container>
    </div>
  );
}
