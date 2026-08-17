"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { CampaignGarment } from "@/components/apparel/CampaignGarment";
import { MarkerTag } from "@/components/marketing/EditorialMarks";

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

/** Hanging from a rail, but overlapping rather than evenly spaced -- x-center
 * and width as a percentage of the studio panel, shared between the
 * rail-graphic's hook marks and the garments themselves so the two stay
 * aligned. Widths run larger than the slot spacing on purpose so neighboring
 * garments overlap slightly, and drop/rotate vary more than a strict grid
 * would, for the "pinned to a mood board" layered read rather than a clean
 * product-shot row. */
const RAIL_SLOTS: { xCenter: number; width: number; rotate: number; drop: number }[] = [
  { xCenter: 12, width: 28, rotate: -5, drop: 0 },
  { xCenter: 38, width: 31, rotate: 3, drop: 3 },
  { xCenter: 66, width: 29, rotate: -2, drop: -1 },
  { xCenter: 90, width: 26, rotate: 4, drop: 4 },
];

/** Real graffiti-category artwork from the STITCH design library (see
 * src/lib/assets/manifest.ts) scattered around the hanging garments as
 * loose accents -- genuine library pieces, not decorative filler, rendered
 * via a plain <img> (the same safe-render path used for these SVGs
 * elsewhere) rather than inlined markup. */
const HERO_GRAFFITI_MARKS: {
  path: string;
  left: string;
  top: string;
  width: string;
  rotate: number;
  opacity: number;
}[] = [
  { path: "/assets/designs/graffiti/spray-paint-star.svg", left: "3%", top: "4%", width: "9%", rotate: -12, opacity: 0.9 },
  { path: "/assets/designs/graffiti/scribble-burst.svg", left: "52%", top: "2%", width: "8%", rotate: 8, opacity: 0.55 },
  { path: "/assets/designs/graffiti/paint-drip.svg", left: "80%", top: "68%", width: "10%", rotate: -6, opacity: 0.7 },
];

function HangingRail({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 125"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      {/* arched studio window, purely atmospheric */}
      <path
        d="M58 92 V38 A20 20 0 0 1 98 38 V92"
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.14}
        strokeWidth={0.6}
      />
      <line x1="78" y1="18" x2="78" y2="92" stroke="currentColor" strokeOpacity={0.1} strokeWidth={0.4} />
      {/* rail */}
      <line x1="6" y1="17" x2="96" y2="17" stroke="currentColor" strokeOpacity={0.35} strokeWidth={0.5} />
      {RAIL_SLOTS.map((slot, i) => (
        <g key={i}>
          <circle cx={slot.xCenter} cy={17} r={1} fill="currentColor" fillOpacity={0.4} />
          <line
            x1={slot.xCenter}
            y1={17}
            x2={slot.xCenter}
            y2={20 + slot.drop}
            stroke="currentColor"
            strokeOpacity={0.3}
            strokeWidth={0.4}
          />
        </g>
      ))}
    </svg>
  );
}

function PlantSprig({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 80 100" className={className} fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round">
      <path d="M40 96V50" />
      <path d="M40 60C28 52 20 40 18 24" />
      <path d="M40 50C52 42 60 30 62 14" />
      <path d="M40 74C30 68 24 58 22 46" />
      <path d="M40 68C50 62 56 52 58 40" />
    </svg>
  );
}

export function Hero({ shirts }: { shirts: HeroShirt[] }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="min-h-[calc(92dvh-4rem)] md:min-h-[calc(92dvh-4.5rem)]">
      <Container>
        <div className="grid items-center gap-10 py-14 md:grid-cols-[0.8fr_1.2fr] md:gap-10 md:py-20">
          <motion.div
            className="flex flex-col gap-6"
            initial={reduceMotion ? false : "hidden"}
            animate="show"
            variants={CONTAINER_VARIANTS}
          >
            <motion.span
              variants={ITEM_VARIANTS}
              className="text-label font-semibold uppercase tracking-[0.18em] text-accent"
            >
              Your canvas. Your story.
            </motion.span>
            <motion.h1
              variants={ITEM_VARIANTS}
              className="font-display text-display-2xl text-foreground"
            >
              Design it.
              <br />
              <span className="italic">Make it yours.</span>
            </motion.h1>
            <motion.p variants={ITEM_VARIANTS} className="max-w-md text-body-lg text-muted">
              Pick a blank tee, drop in art or your own words, preview it on
              the real garment -- then we print and ship it to your door.
            </motion.p>
            <motion.div variants={ITEM_VARIANTS} className="flex flex-wrap items-center gap-6 pt-2">
              <Button
                href="/products"
                variant="primary"
                className="uppercase tracking-wide text-body-sm font-semibold"
              >
                Start designing
              </Button>
              <Link
                href="/inspiration"
                className="text-body-sm font-medium text-foreground underline underline-offset-4 transition-colors hover:text-accent"
              >
                Browse the library
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="relative overflow-hidden rounded-sm"
            initial={reduceMotion ? false : { opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="relative aspect-[4/5]"
              style={{
                background:
                  "linear-gradient(155deg, color-mix(in oklab, var(--color-surface) 60%, white) 0%, var(--color-surface) 60%, color-mix(in oklab, var(--color-surface) 80%, black) 100%)",
              }}
            >
              {/* soft diagonal light beam, studio-window feel */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "linear-gradient(115deg, transparent 30%, color-mix(in oklab, var(--color-background) 70%, white) 45%, transparent 62%)",
                  opacity: 0.6,
                }}
              />
              <HangingRail className="text-foreground" />
              <PlantSprig className="absolute bottom-[3%] left-[2%] h-[22%] w-auto text-foreground/25" />

              {HERO_GRAFFITI_MARKS.map((mark) => (
                // eslint-disable-next-line @next/next/no-img-element -- fixed-size static SVG from the design library, not an optimizable photo
                <img
                  key={mark.path}
                  src={mark.path}
                  alt=""
                  aria-hidden
                  className="pointer-events-none absolute h-auto"
                  style={{
                    left: mark.left,
                    top: mark.top,
                    width: mark.width,
                    opacity: mark.opacity,
                    transform: `rotate(${mark.rotate}deg)`,
                    zIndex: 5,
                  }}
                />
              ))}

              {shirts.map((shirt, index) => {
                const slot = RAIL_SLOTS[index];
                if (!slot) return null;
                return (
                  <CampaignGarment
                    key={index}
                    canvasJson={shirt.canvasJson}
                    hex={shirt.hex}
                    side={shirt.side}
                    label={shirt.label}
                    shadowIntensity={1}
                    style={{
                      position: "absolute",
                      left: `${slot.xCenter - slot.width / 2}%`,
                      top: `${20 + slot.drop}%`,
                      width: `${slot.width}%`,
                      transform: `rotate(${slot.rotate}deg)`,
                      zIndex: 10 + index,
                    }}
                  />
                );
              })}

              <MarkerTag
                rotate={-6}
                className="absolute bottom-[6%] right-[6%] z-20 hidden sm:block"
              >
                stitch it.
              </MarkerTag>
            </div>
          </motion.div>
        </div>
      </Container>
    </div>
  );
}
