"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import {
  DownloadSimple,
  Eye,
  ShieldCheck,
  Truck,
  TShirt,
} from "@phosphor-icons/react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

const CELL_BASE =
  "group relative overflow-hidden rounded-sm border border-border bg-surface transition-[transform,border-color] duration-200 hover:-translate-y-1 hover:border-accent/50";

export function ValueProps() {
  const reduceMotion = useReducedMotion();

  const reveal = (delay: number) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 } as const,
    transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
  });

  return (
    <Section>
      <Container>
        <h2 className="font-display text-display-xl uppercase text-foreground">
          Everything you need, nothing you don&apos;t
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-rows-3 md:[grid-template-columns:repeat(4,1fr)]">
          <motion.div
            {...reveal(0)}
            className={`${CELL_BASE} p-8 md:col-span-2 md:row-span-2 md:col-start-1 md:row-start-1`}
          >
            <div className="absolute inset-0">
              <Image
                src="https://picsum.photos/seed/stitch-garment-texture/900/900"
                alt=""
                fill
                className="object-cover opacity-25 grayscale contrast-125 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/85 to-surface/40" />
            </div>
            <div className="relative flex flex-col gap-3">
              <TShirt className="h-7 w-7 text-accent" weight="duotone" aria-hidden />
              <h3 className="font-display text-display-md uppercase text-foreground">
                Front &amp; back, fully custom
              </h3>
              <p className="max-w-sm text-body text-muted">
                Add text, upload your own art or photos, and place it exactly
                where you want on either side of the shirt.
              </p>
            </div>
          </motion.div>

          <motion.div
            {...reveal(0.08)}
            className={`${CELL_BASE} md:col-start-3 md:row-start-1`}
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src="https://picsum.photos/seed/stitch-mockup-preview/500/375"
                alt=""
                fill
                className="object-cover grayscale contrast-125 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-accent mix-blend-color opacity-20" />
              <Eye
                className="absolute right-3 top-3 h-5 w-5 text-foreground drop-shadow"
                weight="duotone"
                aria-hidden
              />
            </div>
            <div className="p-6">
              <h3 className="text-body-lg font-semibold text-foreground">
                See it before you buy
              </h3>
              <p className="mt-2 text-body-sm text-muted">
                A color-accurate mockup updates live as you design.
              </p>
            </div>
          </motion.div>

          <motion.div
            {...reveal(0.16)}
            className={`${CELL_BASE} p-6 md:col-start-4 md:row-start-1`}
          >
            <DownloadSimple className="h-6 w-6 text-accent" weight="duotone" aria-hidden />
            <h3 className="mt-4 text-body-lg font-semibold text-foreground">
              Free high-res download
            </h3>
            <p className="mt-2 text-body-sm text-muted">
              Export your design as a print-ready PNG, no charge.
            </p>
          </motion.div>

          <motion.div
            {...reveal(0.24)}
            className={`${CELL_BASE} p-6 md:col-span-2 md:col-start-3 md:row-start-2`}
          >
            <ShieldCheck className="h-6 w-6 text-accent" weight="duotone" aria-hidden />
            <h3 className="mt-4 text-body-lg font-semibold text-foreground">
              Every order, quality-checked
            </h3>
            <p className="mt-2 text-body-sm text-muted">
              We review your design for print quality before it goes to our
              print partner.
            </p>
          </motion.div>

          <motion.div
            {...reveal(0.32)}
            className={`${CELL_BASE} bg-gradient-to-r from-accent/15 via-surface to-surface p-8 md:col-span-4 md:col-start-1 md:row-start-3`}
          >
            <div className="flex flex-col gap-3 md:max-w-md">
              <Truck className="h-7 w-7 text-accent" weight="duotone" aria-hidden />
              <h3 className="font-display text-display-md uppercase text-foreground">
                One flat delivery fee
              </h3>
              <p className="text-body text-muted">
                No zones, no surprise charges at checkout. The delivery fee
                is the same wherever you are.
              </p>
            </div>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
