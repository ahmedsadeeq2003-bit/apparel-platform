"use client";

import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import { Container } from "@/components/layout/Container";
import { MagneticButton } from "@/components/marketing/MagneticButton";
import { shirtAssets } from "@/lib/assets/manifest";
import { GARMENT_PHOTO_ASPECT, GARMENT_PRINT_AREA_PCT } from "@/lib/products/garmentPhoto";

const EASE = [0.16, 1, 0.3, 1] as const;
const OVERSHOOT = [0.34, 1.56, 0.64, 1] as const;

/** The one real photographed Classic Tee color with the strongest
 * silhouette (see Hero.tsx's identical reasoning) -- reused here as the
 * garment itself, not the print-area math, which is this file's own. */
const HERO_GARMENT = shirtAssets.classicTee.black.front;

const HEADLINE = [{ text: "You don't just shop for a shirt." }, { text: "You create one.", italic: true }];

const LINE_CONTAINER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14, delayChildren: 0.1 } },
};

function lineVariants(index: number): Variants {
  return {
    hidden: { opacity: 0, y: 30, rotate: index === 0 ? -1.5 : 1.5 },
    show: { opacity: 1, y: 0, rotate: 0, transition: { duration: 0.7, ease: EASE } },
  };
}

/** Real library artwork landing inside the actual print-safe region (see
 * GARMENT_PRINT_AREA_PCT -- the same box the live editor, CampaignGarment
 * and ArtworkOnGarment all already use), positioned as percentages of that
 * box rather than the whole photo, so "landing on the shirt" always means
 * landing where a real print actually would. Near-black library SVGs get
 * `invert(1)` to read as a white print against the black tee -- the same
 * technique the homepage Hero already uses for its own settling mark. */
type SettlingPiece = {
  path: string;
  leftPct: number;
  topPct: number;
  widthPct: number;
  rotate: number;
  delay: number;
  from: { x: number; y: number; rotate: number; scale: number };
};

const SETTLING_PIECES: SettlingPiece[] = [
  {
    path: "/assets/designs/typography/good-energy.svg",
    leftPct: 50,
    topPct: 58,
    widthPct: 62,
    rotate: -2,
    delay: 1.3,
    from: { x: 0, y: -90, rotate: -18, scale: 0.4 },
  },
  {
    path: "/assets/designs/graffiti/hand-drawn-crown.svg",
    leftPct: 80,
    topPct: 18,
    widthPct: 26,
    rotate: 10,
    delay: 1.65,
    from: { x: 70, y: -60, rotate: 40, scale: 0.35 },
  },
];

/** Small ambient marks drifting around the garment -- fewer and quieter
 * than the homepage Hero's own set, so this reads as an echo of that
 * established technique rather than a duplicate of the exact composition. */
const AMBIENT_MARKS: { path: string; left: string; top: string; width: string; rotate: number; delay: number }[] = [
  { path: "/assets/designs/graffiti/spray-paint-star.svg", left: "6%", top: "10%", width: "6%", rotate: -10, delay: 0.9 },
  { path: "/assets/designs/abstract/kinetic-lines.svg", left: "88%", top: "70%", width: "8%", rotate: 6, delay: 1.05 },
];

function AtmosphereBackground() {
  const reduceMotion = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(115% 90% at 50% 10%, color-mix(in oklab, var(--color-accent) 13%, transparent) 0%, transparent 55%), linear-gradient(170deg, color-mix(in oklab, var(--color-surface) 55%, white) 0%, var(--color-background) 55%, var(--color-surface) 100%)",
        }}
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      />
      <motion.span
        className="absolute left-1/2 top-[4%] -translate-x-1/2 select-none whitespace-nowrap font-display text-[24vw] leading-none text-foreground/[0.035] md:text-[14vw]"
        initial={reduceMotion ? false : { opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.3, ease: EASE }}
      >
        STUDIO
      </motion.span>
    </div>
  );
}

/**
 * Design Hub's own opening beat -- deliberately not InspirationHero with
 * different copy. Where InspirationHero orbits real artwork around a
 * headline with no product in frame (right for a page about browsing
 * ideas), this hero stages the real garment itself, front and center, with
 * real artwork landing inside its actual print area while the customer
 * watches -- "you don't just shop for a shirt, you create one" shown, not
 * just said. Copy sits above the garment (centered, single column) rather
 * than beside it as the homepage Hero does, so the garment reads as the
 * page's one focal object instead of splitting attention with a headline
 * beside it.
 */
export function DesignHubHero({ editorHref }: { editorHref: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden pb-8 pt-16 md:pt-24">
      <AtmosphereBackground />

      <Container>
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <motion.span
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="text-label font-semibold uppercase tracking-[0.18em] text-accent"
          >
            Your creative workspace
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
            Real artwork, real templates, a real garment underneath it all -- everything below leads straight into
            the studio.
          </motion.p>

          <motion.div
            className="mt-8 flex justify-center"
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.7, ease: EASE }}
          >
            <MagneticButton
              href={editorHref}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-accent px-8 text-body-sm font-semibold uppercase tracking-wide text-accent-foreground transition-opacity hover:opacity-90"
            >
              Start designing
              <ArrowRight size={16} weight="bold" aria-hidden />
            </MagneticButton>
          </motion.div>
        </div>

        {/* The garment: large, centered, the page's one focal object -- see
            the module comment for why this differs from both the homepage
            Hero (garment off to one side) and InspirationHero (no garment
            at all). */}
        <div className="relative z-0 mx-auto mt-14 w-full max-w-sm md:mt-16">
          <div className="relative" style={{ perspective: 1400 }}>
            {!reduceMotion &&
              AMBIENT_MARKS.map((mark) => (
                <motion.div
                  key={mark.path}
                  className="pointer-events-none absolute z-0"
                  style={{ left: mark.left, top: mark.top, width: mark.width }}
                  animate={{ y: [0, -8, 0], rotate: [mark.rotate, mark.rotate + 3, mark.rotate] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: mark.delay + 1 }}
                >
                  <motion.img
                    src={mark.path}
                    alt=""
                    aria-hidden
                    className="h-auto w-full text-foreground"
                    initial={{ opacity: 0, scale: 0.4 }}
                    animate={{ opacity: 0.55, scale: 1 }}
                    transition={{ duration: 0.7, delay: mark.delay, ease: EASE }}
                  />
                </motion.div>
              ))}

            <motion.div
              className="relative"
              style={{ transformStyle: "preserve-3d" }}
              initial={reduceMotion ? {} : { opacity: 0, y: 60, scale: 0.9, rotateY: -22, rotateX: 5 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotateY: 0, rotateX: 0 }}
              transition={{ duration: 1.0, delay: reduceMotion ? 0 : 0.35, ease: EASE }}
            >
              <div
                className="relative"
                style={{ filter: "drop-shadow(0 26px 36px rgba(22,20,15,0.26)) drop-shadow(0 6px 10px rgba(22,20,15,0.16))" }}
              >
                <Image
                  src={HERO_GARMENT.path}
                  alt="Blank Classic Tee, ready to design"
                  width={GARMENT_PHOTO_ASPECT.width}
                  height={GARMENT_PHOTO_ASPECT.height}
                  priority
                  className="h-auto w-full"
                />

                <div
                  className="pointer-events-none absolute"
                  style={{
                    left: `${GARMENT_PRINT_AREA_PCT.left}%`,
                    top: `${GARMENT_PRINT_AREA_PCT.top}%`,
                    width: `${GARMENT_PRINT_AREA_PCT.width}%`,
                    height: `${GARMENT_PRINT_AREA_PCT.height}%`,
                  }}
                >
                  {SETTLING_PIECES.map((piece) => (
                    <motion.img
                      key={piece.path}
                      src={piece.path}
                      alt=""
                      aria-hidden
                      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
                      style={{
                        left: `${piece.leftPct}%`,
                        top: `${piece.topPct}%`,
                        width: `${piece.widthPct}%`,
                        filter: "invert(1)",
                      }}
                      initial={
                        reduceMotion
                          ? { opacity: 0.95, rotate: piece.rotate }
                          : {
                              opacity: 0,
                              x: piece.from.x,
                              y: piece.from.y,
                              rotate: piece.from.rotate,
                              scale: piece.from.scale,
                            }
                      }
                      animate={{
                        opacity: 0.95,
                        x: 0,
                        y: 0,
                        rotate: [piece.from.rotate, piece.rotate - 4, piece.rotate],
                        scale: [piece.from.scale, 1.08, 1],
                      }}
                      transition={{ duration: 0.8, delay: reduceMotion ? 0 : piece.delay, ease: EASE }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.span
              aria-hidden
              className="absolute -right-2 bottom-2 hidden select-none rounded-full border border-border bg-background px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted shadow-sm sm:block"
              initial={reduceMotion ? false : { opacity: 0, scale: 0.7, rotate: -18 }}
              animate={{ opacity: 1, scale: 1, rotate: -4 }}
              transition={{ duration: 0.5, delay: reduceMotion ? 0 : 2.0, ease: OVERSHOOT }}
            >
              live print area
            </motion.span>
          </div>
        </div>
      </Container>
    </section>
  );
}
