"use client";

import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { CampaignGarment } from "@/components/apparel/CampaignGarment";

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
 * Campaign composition slots: one dominant central garment, two foreground
 * garments cropped by the frame edge, three receding into the background
 * with softer focus. Only `width` is ever set alongside `aspect-[400/480]`
 * on CampaignGarment -- setting an explicit height too would fight the
 * aspect-ratio and distort the silhouette.
 */
const GARMENT_SLOTS: (CSSProperties & { blurPx: number; shadowIntensity: number })[] = [
  // 0 streetwear -- dominant, centered, sharpest focus
  { position: "absolute", left: "27%", top: "4%", width: "42%", zIndex: 20, transform: "rotate(-2deg)", blurPx: 0, shadowIntensity: 1.2 },
  // 1 graduation -- foreground, bottom-left, cropped by the frame
  { position: "absolute", left: "-8%", top: "48%", width: "40%", zIndex: 30, transform: "rotate(9deg)", blurPx: 0, shadowIntensity: 1.25 },
  // 2 couples -- foreground, bottom-right, cropped, the pop-of-color garment
  { position: "absolute", left: "72%", top: "50%", width: "38%", zIndex: 25, transform: "rotate(-7deg)", blurPx: 0, shadowIntensity: 1.15 },
  // 3 events -- midground, upper-left, behind the dominant shirt
  { position: "absolute", left: "1%", top: "-2%", width: "30%", zIndex: 10, transform: "rotate(-11deg)", opacity: 0.9, blurPx: 1, shadowIntensity: 0.7 },
  // 4 football -- background, upper-right, back view, softest focus
  { position: "absolute", left: "68%", top: "0%", width: "27%", zIndex: 5, transform: "rotate(8deg)", opacity: 0.78, blurPx: 2.5, shadowIntensity: 0.45 },
  // 5 business -- small midground accent tucked beside the dominant shirt
  { position: "absolute", left: "47%", top: "36%", width: "21%", zIndex: 15, transform: "rotate(4deg)", opacity: 0.95, blurPx: 0.5, shadowIntensity: 0.85 },
];

export function Hero({ shirts }: { shirts: HeroShirt[] }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="min-h-[calc(92dvh-4rem)] md:min-h-[calc(92dvh-4.5rem)]">
      <Container>
        <div className="grid items-center gap-10 py-14 md:grid-cols-[0.82fr_1.18fr] md:gap-8 md:py-20">
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
            className="relative overflow-hidden"
            initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="relative aspect-[6/7]">
              {/* Art-directed environment: a soft studio-light pool behind
                  the dominant garment, not a literal photo. */}
              <div
                aria-hidden
                className="pointer-events-none absolute left-[18%] top-[2%] h-[62%] w-[64%] rounded-full opacity-70 blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, color-mix(in oklab, var(--color-accent) 22%, transparent) 0%, transparent 70%)",
                }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute bottom-0 right-[4%] h-[46%] w-[46%] rounded-full opacity-80 blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle, color-mix(in oklab, var(--color-foreground) 8%, transparent) 0%, transparent 70%)",
                }}
              />

              {shirts.map((shirt, index) => {
                const slot = GARMENT_SLOTS[index];
                if (!slot) return null;
                const { blurPx, shadowIntensity, ...style } = slot;
                return (
                  <CampaignGarment
                    key={index}
                    canvasJson={shirt.canvasJson}
                    hex={shirt.hex}
                    side={shirt.side}
                    label={shirt.label}
                    blurPx={blurPx}
                    shadowIntensity={shadowIntensity}
                    style={style}
                  />
                );
              })}
            </div>
          </motion.div>
        </div>
      </Container>
    </div>
  );
}
