"use client";

import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { TemplatePreview } from "@/components/apparel/TemplatePreview";

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

export function Hero({ shirts }: { shirts: HeroShirt[] }) {
  const reduceMotion = useReducedMotion();
  const [back, front] = shirts;
  const third = shirts[2];

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
              Your tee.
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
            className="relative aspect-[4/5]"
            initial={reduceMotion ? false : { opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            {third && (
              <TemplatePreview
                canvasJson={third.canvasJson}
                hex={third.hex}
                side={third.side}
                label={third.label}
                className="absolute left-[16%] top-0 h-[62%] w-[54%] rotate-[8deg] shadow-2xl"
              />
            )}
            {back && (
              <TemplatePreview
                canvasJson={back.canvasJson}
                hex={back.hex}
                side={back.side}
                label={back.label}
                className="absolute left-0 top-[16%] h-[72%] w-[62%] rotate-[-7deg] shadow-2xl"
              />
            )}
            {front && (
              <TemplatePreview
                canvasJson={front.canvasJson}
                hex={front.hex}
                side={front.side}
                label={front.label}
                className="absolute bottom-0 right-0 h-[78%] w-[68%] rotate-[3deg] shadow-2xl"
              />
            )}
          </motion.div>
        </div>
      </Container>
    </div>
  );
}
