"use client";

import { ArrowDown, Image as ImageIcon, Package, PaintBrush, TextAa } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { CampaignGarment } from "@/components/apparel/CampaignGarment";
import type { HeroShirt } from "@/components/marketing/Hero";

const EASE = [0.16, 1, 0.3, 1] as const;

const STEPS = [
  {
    number: "01",
    title: "Upload Your Art",
    description:
      "Import photos, illustrations, logos, or simply type your text into the typography studio.",
    from: -60,
  },
  {
    number: "02",
    title: "Design & Preview",
    description:
      "Drag, drop, and resize your artwork, then preview the finished design on a real shirt.",
    from: 0,
  },
  {
    number: "03",
    title: "We Print & Ship",
    description:
      "We print your design and get the finished shirt to your door.",
    from: 60,
  },
] as const;

function StillLife({ variant }: { variant: "upload" | "ship" }) {
  const icons =
    variant === "upload"
      ? [PaintBrush, TextAa, ImageIcon]
      : [Package];

  return (
    <div
      className="relative flex h-full w-full items-center justify-center gap-6"
      style={{
        background:
          "linear-gradient(160deg, color-mix(in oklab, var(--color-background) 70%, white) 0%, var(--color-background) 100%)",
      }}
    >
      {icons.map((Icon, i) => (
        <span
          key={i}
          className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm md:h-20 md:w-20"
        >
          <Icon size={28} weight="light" />
        </span>
      ))}
    </div>
  );
}

export function HowItWorks({ preview }: { preview: HeroShirt | null }) {
  const reduceMotion = useReducedMotion();

  return (
    <Section id="how-it-works" tone="raised">
      <Container>
        <motion.div
          className="flex flex-col items-center text-center"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <span className="text-label font-semibold uppercase tracking-[0.18em] text-muted">
            Made simple with love
          </span>
          <h2 className="mt-3 font-display text-display-xl text-foreground">
            How STITCH Works
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.number}
              className="relative flex flex-col overflow-hidden rounded-sm border border-border bg-background p-6"
              initial={reduceMotion ? false : { opacity: 0, x: step.from, y: 30 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: index * 0.15, ease: EASE }}
            >
              {/* Oversized numeral as a background watermark -- "large
                  numbered typography" the brief asks for, without crowding
                  the real content that sits on top of it. */}
              <motion.span
                aria-hidden
                className="pointer-events-none absolute -right-3 -top-8 select-none font-display text-[7.5rem] italic leading-none text-accent/[0.08]"
                initial={reduceMotion ? false : { scale: 0.7, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: index * 0.15 + 0.1, ease: EASE }}
              >
                {step.number}
              </motion.span>

              <div className="relative flex items-start justify-between">
                <span className="font-display text-display-md italic text-accent">
                  {step.number}
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted">
                  <ArrowDown size={14} weight="bold" />
                </span>
              </div>
              <div className="relative mt-4 aspect-[4/3] overflow-hidden rounded-sm border border-border">
                {index === 1 && preview ? (
                  <div
                    className="relative flex h-full w-full items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(160deg, color-mix(in oklab, var(--color-background) 70%, white) 0%, var(--color-background) 100%)",
                    }}
                  >
                    <motion.div
                      initial={reduceMotion ? false : { scale: 0.8, rotate: -6, opacity: 0 }}
                      whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.7, delay: index * 0.15 + 0.25, ease: EASE }}
                      style={{ width: "58%" }}
                    >
                      <CampaignGarment
                        canvasJson={preview.canvasJson}
                        hex={preview.hex}
                        side={preview.side}
                        label={preview.label}
                        shadowIntensity={0.7}
                      />
                    </motion.div>
                  </div>
                ) : (
                  <StillLife variant={index === 0 ? "upload" : "ship"} />
                )}
              </div>
              <h3 className="relative mt-6 font-display text-display-md text-foreground">
                {step.title}
              </h3>
              <p className="relative mt-2 text-body text-muted">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
