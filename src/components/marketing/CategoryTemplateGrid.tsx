"use client";

import { motion, useReducedMotion } from "motion/react";
import { CampaignGarment } from "@/components/apparel/CampaignGarment";
import { designTypeLabel } from "@/lib/templates/designType";
import type { DesignTemplate } from "@/lib/templates/queries";

/** Real garment photography (CampaignGarment), replacing the old flat
 * TShirtMockup-backed TemplatePreview -- brings this category drill-down
 * grid in line with the rest of the redesigned site (InspirationGrid,
 * TemplatesShowcase, Products all already use real photos exclusively).
 * `template.colors[0]` is a template-authored curated hex, not necessarily
 * a photographed color -- CampaignGarment's own nearestHex logic picks
 * whichever real photo reads closest, same as everywhere else it's used. */
export function CategoryTemplateGrid({ templates }: { templates: DesignTemplate[] }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 md:grid-cols-4">
      {templates.map((template, index) => (
        <motion.div
          key={template.id}
          className="flex flex-col gap-4"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="relative aspect-square overflow-hidden rounded-sm"
            style={{
              background:
                "linear-gradient(160deg, color-mix(in oklab, var(--color-background) 70%, white) 0%, var(--color-background) 100%)",
            }}
          >
            <span className="absolute left-3 top-3 z-10 rounded-full bg-background px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-foreground shadow-sm">
              {designTypeLabel(template.design_type)}
            </span>
            <CampaignGarment
              canvasJson={template.canvas_json}
              hex={template.colors[0] ?? "#F4F2EC"}
              side={template.print_area === "back" ? "back" : "front"}
              label={template.name}
              className="absolute left-1/2 top-[8%] w-[72%] -translate-x-1/2 transition-transform duration-500 hover:scale-[1.03]"
              shadowIntensity={0.8}
            />
          </div>
          <span className="text-body-sm text-muted">{template.name}</span>
        </motion.div>
      ))}
    </div>
  );
}
