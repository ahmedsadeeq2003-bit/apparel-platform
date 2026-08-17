"use client";

import { ImageIcon, TextAa, UploadSimple } from "@phosphor-icons/react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { CampaignGarment } from "@/components/apparel/CampaignGarment";
import { TShirtMockup } from "@/components/apparel/TShirtMockup";

const EASE = [0.16, 1, 0.3, 1] as const;

function LeafSprig({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 60 100" className={className} fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round">
      <path d="M30 96C26 70 20 46 6 24" />
      <ellipse cx="16" cy="34" rx="9" ry="4" transform="rotate(-30 16 34)" />
      <ellipse cx="10" cy="52" rx="9" ry="4" transform="rotate(-15 10 52)" />
      <ellipse cx="22" cy="16" rx="8" ry="3.5" transform="rotate(-45 22 16)" />
    </svg>
  );
}

type Preview = { canvasJson: object; hex: string; side: "front" | "back"; label: string };

/** Each starting-point tile flies in from its own direction (picture the
 * six tiles as points on a compass converging on the list) rather than a
 * uniform fade -- this section's one kinetic idea, distinct from the
 * Hero's converge-onto-garment and WhatIsStitch's horizontal slide. */
const TILE_FROM: { x: number; y: number }[] = [
  { x: -34, y: 0 },
  { x: 34, y: 0 },
  { x: 0, y: -30 },
  { x: -34, y: 22 },
  { x: 34, y: 22 },
  { x: 0, y: 30 },
];

const TILE_CONTAINER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

function tileVariants(from: { x: number; y: number }): Variants {
  return {
    hidden: { opacity: 0, x: from.x, y: from.y, scale: 0.7 },
    show: { opacity: 1, x: 0, y: 0, scale: 1, transition: { duration: 0.55, ease: EASE } },
  };
}

/** The five real starting points the editor actually offers -- shown as
 * small visuals rather than an ordinary icon list, so the section proves
 * "you don't have to be a designer" instead of just claiming it. Blank and
 * Template use the same real garment-rendering components as the rest of
 * the page (no invented imagery); Artwork uses one real library SVG;
 * Upload/Text are actions with no existing asset to show, so those two
 * stay icon-only rather than faking a visual for them. */
function StartingPoints({ template }: { template: Preview }) {
  const reduceMotion = useReducedMotion();
  const items = [
    <span key="blank" className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-border bg-background">
      <TShirtMockup hex="#F4F2EC" side="front" crop="print-area" label="Blank shirt" className="h-full w-full" />
    </span>,
    <span key="template" className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-border bg-background">
      <CampaignGarment canvasJson={template.canvasJson} hex={template.hex} side={template.side} label={template.label} className="w-[85%]" shadowIntensity={0} />
    </span>,
    <span key="artwork" className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-border bg-background p-4">
      {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size static SVG from the design library */}
      <img src="/assets/designs/graffiti/hand-drawn-crown.svg" alt="" aria-hidden className="h-full w-full object-contain" />
    </span>,
    <span key="upload" className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-background text-foreground">
      <UploadSimple size={26} weight="light" />
    </span>,
    <span key="text" className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-background text-foreground">
      <TextAa size={26} weight="light" />
    </span>,
    <span key="mix" className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-background text-foreground">
      <ImageIcon size={26} weight="light" />
    </span>,
  ];
  const labels = ["A blank canvas", "A ready-made template", "Art from the library", "Your own upload", "Your own words", "Mix and match"];

  return (
    <motion.ul
      className="grid grid-cols-2 gap-4 sm:grid-cols-3"
      initial={reduceMotion ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      variants={TILE_CONTAINER}
    >
      {items.map((visual, i) => (
        <motion.li
          key={i}
          className={`flex flex-col items-center gap-2 text-center ${i === 5 ? "hidden sm:flex" : ""}`}
          variants={tileVariants(TILE_FROM[i])}
        >
          {visual}
          <span className="text-body-sm font-medium text-foreground">{labels[i]}</span>
        </motion.li>
      ))}
    </motion.ul>
  );
}

export function DesignYourWay({ preview }: { preview: Preview }) {
  const reduceMotion = useReducedMotion();

  return (
    <Section tone="raised">
      <Container>
        <div className="grid items-center gap-14 md:grid-cols-2">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: "-12%", rotate: -3 }}
            whileInView={{ opacity: 1, x: 0, rotate: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.85, ease: EASE }}
            className="relative overflow-hidden rounded-sm"
          >
            <div
              className="relative aspect-[6/5]"
              style={{
                background:
                  "linear-gradient(150deg, color-mix(in oklab, var(--color-background) 70%, white) 0%, var(--color-background) 65%, color-mix(in oklab, var(--color-background) 85%, black) 100%)",
              }}
            >
              <LeafSprig className="absolute right-[8%] top-[6%] h-[26%] w-auto text-foreground/20" />
              <LeafSprig className="absolute bottom-[6%] left-[10%] h-[20%] w-auto rotate-[160deg] text-foreground/15" />
              <CampaignGarment
                canvasJson={preview.canvasJson}
                hex={preview.hex}
                side={preview.side}
                label={preview.label}
                shadowIntensity={1.1}
                style={{
                  position: "absolute",
                  left: "20%",
                  top: "10%",
                  width: "60%",
                  transform: "rotate(-4deg)",
                }}
              />
            </div>
          </motion.div>
          <div className="flex flex-col gap-6">
            <motion.span
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="text-label font-semibold uppercase tracking-[0.18em] text-accent"
            >
              Tailored expression
            </motion.span>
            <motion.h2
              className="font-display text-display-xl text-foreground"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.08, ease: EASE }}
            >
              You Don&rsquo;t Have to Be a Designer
            </motion.h2>
            <motion.p
              className="max-w-md text-body-lg text-muted"
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: reduceMotion ? 0 : 0.15, ease: EASE }}
            >
              Start from nothing, or start from something -- a template, a
              piece of real artwork, a photo you took, or just your own
              words. However you start, you finish with a shirt that&rsquo;s
              actually yours.
            </motion.p>
            <StartingPoints template={preview} />
            <Button href="/products" variant="secondary" className="mt-2 w-fit uppercase tracking-wide text-body-sm font-semibold">
              Explore the editor
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
