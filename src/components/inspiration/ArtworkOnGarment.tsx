"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { Container } from "@/components/layout/Container";
import { PHOTO_OVERLAY_PCT } from "@/components/apparel/CampaignGarment";
import { GARMENT_PHOTO_ASPECT } from "@/lib/products/garmentPhoto";

const EASE = [0.16, 1, 0.3, 1] as const;

export type GarmentDemoPiece = {
  id: string;
  artworkPath: string;
  artworkName: string;
  categoryLabel: string;
  photoPath: string;
  colorName: string;
  editorHref: string;
};

const ROTATIONS = [-2, 1.5, -1, 2] as const;
const LIFTS = ["0", "1.25rem", "-0.75rem", "0.5rem"] as const;

const CONTAINER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

function cardVariants(index: number): Variants {
  const fromBelow = index % 2 === 1;
  return {
    hidden: { opacity: 0, y: fromBelow ? 50 : -50, rotate: 0, scale: 0.92 },
    show: {
      opacity: 1,
      y: 0,
      rotate: ROTATIONS[index % ROTATIONS.length],
      scale: 1,
      transition: { duration: 0.65, ease: EASE },
    },
  };
}

/**
 * "This is what it actually looks like" -- real artwork (designAssets)
 * composited onto the real photographed Classic Tee (shirtAssets), at the
 * same print-area coordinates CampaignGarment already uses elsewhere on the
 * site (imported, not re-eyeballed). Deliberately not a Fabric canvas or
 * TShirtMockup: this is a plain, absolutely-positioned `<img>` over a real
 * photo -- honest about being a flat preview of a placement, not a live
 * design tool (that's the editor's job). Each card is a real "Add to
 * design" entry point, same contract as ArtworkLibrary's cards below on
 * this page -- both artwork surfaces, so both use artwork's own action
 * verb, distinct from a template's "Customize" (see TemplatesShowcase).
 */
export function ArtworkOnGarment({ pieces }: { pieces: GarmentDemoPiece[] }) {
  const reduceMotion = useReducedMotion();

  if (pieces.length === 0) return null;

  return (
    <section className="py-section" style={{ background: "var(--color-surface)" }}>
      <Container>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex flex-col gap-2"
        >
          <span className="text-label font-semibold uppercase tracking-[0.18em] text-accent">
            See it on the shirt
          </span>
          <h2 className="font-display text-display-xl text-foreground">Not a mockup. The real thing.</h2>
          <p className="max-w-md text-body-lg text-muted">
            Real artwork on the real Classic Tee, photographed -- exactly what you&apos;ll be working with in the
            studio.
          </p>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={CONTAINER}
          className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8"
        >
          {pieces.map((piece, index) => (
            <motion.div
              key={piece.id}
              variants={cardVariants(index)}
              style={{ marginTop: LIFTS[index % LIFTS.length] }}
            >
              <Link
                href={piece.editorHref}
                aria-label={`Use ${piece.artworkName} on a shirt`}
                className="group relative block"
              >
                <motion.div
                  className="relative aspect-[4/5] overflow-hidden rounded-sm bg-background"
                  whileHover={reduceMotion ? undefined : { scale: 1.03, rotate: 0 }}
                  transition={{ duration: 0.4, ease: EASE }}
                >
                  <Image
                    src={piece.photoPath}
                    alt={`${piece.colorName} Classic Tee`}
                    width={GARMENT_PHOTO_ASPECT.width}
                    height={GARMENT_PHOTO_ASPECT.height}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div
                    className="pointer-events-none absolute flex items-center justify-center"
                    style={{
                      left: `${PHOTO_OVERLAY_PCT.left}%`,
                      top: `${PHOTO_OVERLAY_PCT.top}%`,
                      width: `${PHOTO_OVERLAY_PCT.width}%`,
                      height: `${PHOTO_OVERLAY_PCT.height}%`,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size static SVG from the design library */}
                    <img
                      src={piece.artworkPath}
                      alt=""
                      aria-hidden
                      className="h-[45%] w-[45%] object-contain drop-shadow-sm transition-transform duration-500 ease-out group-hover:scale-110"
                    />
                  </div>
                  <span className="absolute right-3 top-3 flex translate-y-1 items-center gap-1 whitespace-nowrap rounded-full bg-accent px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-accent-foreground opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
                    Add to design
                    <ArrowUpRight size={11} weight="bold" aria-hidden />
                  </span>
                </motion.div>
                <div className="mt-3 flex flex-col">
                  <span className="text-body-sm font-medium text-foreground">{piece.artworkName}</span>
                  <span className="text-[0.7rem] font-medium uppercase tracking-[0.08em] text-muted">
                    {piece.categoryLabel} &middot; {piece.colorName}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
