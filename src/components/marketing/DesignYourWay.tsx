"use client";

import { motion, useReducedMotion } from "motion/react";
import { TextT, Image as ImageIcon, PaintBucket, Crosshair } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { CampaignGarment } from "@/components/apparel/CampaignGarment";

const CAPABILITIES = [
  { icon: TextT, label: "Text, in any font on the shirt" },
  { icon: ImageIcon, label: "Your own artwork or photos" },
  { icon: PaintBucket, label: "Any shirt color" },
  { icon: Crosshair, label: "Placed exactly where you want it" },
] as const;

export function DesignYourWay({
  preview,
}: {
  preview: { canvasJson: object; hex: string; side: "front" | "back"; label: string };
}) {
  const reduceMotion = useReducedMotion();

  return (
    <Section tone="raised">
      <Container>
        <div className="grid items-center gap-16 md:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto w-full max-w-[420px]"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, color-mix(in oklab, var(--color-accent) 16%, transparent) 0%, transparent 70%)",
              }}
            />
            <CampaignGarment
              canvasJson={preview.canvasJson}
              hex={preview.hex}
              side={preview.side}
              label={preview.label}
              className="relative mx-auto w-[78%]"
              shadowIntensity={1.3}
            />
          </motion.div>
          <div className="flex flex-col gap-6">
            <h2 className="font-display text-display-xl uppercase text-foreground">
              The canvas is the shirt itself.
            </h2>
            <p className="max-w-md text-body-lg text-muted">
              A real design canvas, right in your browser. Text, artwork and
              photos sit on the actual garment, not a preview stitched
              together after the fact.
            </p>
            <ul className="flex flex-col gap-3">
              {CAPABILITIES.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3 text-body text-foreground">
                  <Icon className="h-5 w-5 shrink-0 text-accent" weight="duotone" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
            <Button href="/products" variant="primary" className="mt-2 w-fit">
              Open the designer
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
