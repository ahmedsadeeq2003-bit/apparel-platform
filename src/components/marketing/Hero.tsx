"use client";

import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { TShirtMockup } from "@/components/apparel/TShirtMockup";

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

export function Hero() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="min-h-[calc(92dvh-4rem)] md:min-h-[calc(92dvh-4.5rem)]">
      <Container>
        <div className="grid items-center gap-12 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-24">
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
              Design your own tee.
              <br />
              Wear the proof.
            </motion.h1>
            <motion.p variants={ITEM_VARIANTS} className="max-w-md text-body-lg text-muted">
              Drop text, art, and photos onto a shirt right in your browser.
              We print it and ship it to your door.
            </motion.p>
            <motion.div variants={ITEM_VARIANTS} className="flex flex-wrap gap-4 pt-2">
              <Button href="/signup" variant="primary">
                Start designing
              </Button>
              <Button href="#how-it-works" variant="secondary">
                See how it works
              </Button>
            </motion.div>
          </motion.div>
          <motion.div
            className="relative aspect-[4/5]"
            initial={reduceMotion ? false : { opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <TShirtMockup
              hex="#F4F2EC"
              side="front"
              crop="full"
              label="Bone-colored T-shirt design"
              className="absolute left-[6%] top-[10%] h-[78%] w-[68%] rotate-[-6deg] drop-shadow-2xl"
            />
            <TShirtMockup
              hex="#D7FF3E"
              side="front"
              crop="full"
              label="Volt green T-shirt design"
              className="absolute bottom-[4%] right-[2%] h-[82%] w-[72%] rotate-[4deg] drop-shadow-2xl"
            />
          </motion.div>
        </div>
      </Container>
    </div>
  );
}
