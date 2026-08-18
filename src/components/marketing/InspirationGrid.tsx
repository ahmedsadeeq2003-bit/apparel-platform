"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { CampaignGarment } from "@/components/apparel/CampaignGarment";
import { EDITORIAL_GARMENT_COLORS } from "@/lib/templates/garmentColors";
import { designTypeLabel } from "@/lib/templates/designType";
import type { DesignTemplate, TemplateCategory } from "@/lib/templates/queries";

export function InspirationGrid({
  featured,
}: {
  featured: { category: TemplateCategory; template: DesignTemplate }[];
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
      {featured.map(({ category, template }, index) => (
        <motion.div
          key={category.id}
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link href={`/inspiration/${category.slug}`} className="group flex flex-col gap-4">
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
                hex={EDITORIAL_GARMENT_COLORS[category.slug] ?? "#EDEADF"}
                side={template.print_area === "back" ? "back" : "front"}
                label={`${template.name}, ${category.name} template`}
                className="absolute left-1/2 top-[8%] w-[72%] -translate-x-1/2 transition-transform group-hover:scale-[1.03]"
                shadowIntensity={0.8}
              />
            </div>
            <div>
              <h3 className="font-display text-body-lg text-foreground">{template.name}</h3>
              <p className="mt-1 text-body-sm text-muted">From the STITCH library</p>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
