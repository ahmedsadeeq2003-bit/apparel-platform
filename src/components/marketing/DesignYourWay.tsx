"use client";

import { ImageIcon, TextAa, UploadSimple } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { CampaignGarment } from "@/components/apparel/CampaignGarment";
import { TShirtMockup } from "@/components/apparel/TShirtMockup";

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

/** The five real starting points the editor actually offers -- shown as
 * small visuals rather than an ordinary icon list, so the section proves
 * "you don't have to be a designer" instead of just claiming it. Blank and
 * Template use the same real garment-rendering components as the rest of
 * the page (no invented imagery); Artwork uses one real library SVG;
 * Upload/Text are actions with no existing asset to show, so those two
 * stay icon-only rather than faking a visual for them. */
function StartingPoints({ template }: { template: Preview }) {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <li className="flex flex-col items-center gap-2 text-center">
        <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-border bg-background">
          <TShirtMockup hex="#F4F2EC" side="front" crop="print-area" label="Blank shirt" className="h-full w-full" />
        </span>
        <span className="text-body-sm font-medium text-foreground">A blank canvas</span>
      </li>
      <li className="flex flex-col items-center gap-2 text-center">
        <span className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-border bg-background">
          <CampaignGarment
            canvasJson={template.canvasJson}
            hex={template.hex}
            side={template.side}
            label={template.label}
            className="w-[85%]"
            shadowIntensity={0}
          />
        </span>
        <span className="text-body-sm font-medium text-foreground">A ready-made template</span>
      </li>
      <li className="flex flex-col items-center gap-2 text-center">
        <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-border bg-background p-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size static SVG from the design library */}
          <img src="/assets/designs/graffiti/hand-drawn-crown.svg" alt="" aria-hidden className="h-full w-full object-contain" />
        </span>
        <span className="text-body-sm font-medium text-foreground">Art from the library</span>
      </li>
      <li className="flex flex-col items-center gap-2 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-background text-foreground">
          <UploadSimple size={26} weight="light" />
        </span>
        <span className="text-body-sm font-medium text-foreground">Your own upload</span>
      </li>
      <li className="flex flex-col items-center gap-2 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-background text-foreground">
          <TextAa size={26} weight="light" />
        </span>
        <span className="text-body-sm font-medium text-foreground">Your own words</span>
      </li>
      <li className="hidden flex-col items-center gap-2 text-center sm:flex">
        <span className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-background text-foreground">
          <ImageIcon size={26} weight="light" />
        </span>
        <span className="text-body-sm font-medium text-foreground">Mix and match</span>
      </li>
    </ul>
  );
}

export function DesignYourWay({ preview }: { preview: Preview }) {
  const reduceMotion = useReducedMotion();

  return (
    <Section tone="raised">
      <Container>
        <div className="grid items-center gap-14 md:grid-cols-2">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
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
            <span className="text-label font-semibold uppercase tracking-[0.18em] text-accent">
              Tailored expression
            </span>
            <h2 className="font-display text-display-xl text-foreground">
              You Don&rsquo;t Have to Be a Designer
            </h2>
            <p className="max-w-md text-body-lg text-muted">
              Start from nothing, or start from something -- a template, a
              piece of real artwork, a photo you took, or just your own
              words. However you start, you finish with a shirt that&rsquo;s
              actually yours.
            </p>
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
