"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import { Container } from "@/components/layout/Container";
import { CampaignGarment } from "@/components/apparel/CampaignGarment";
import { EDITORIAL_GARMENT_COLORS } from "@/lib/templates/garmentColors";
import { designTypeLabel } from "@/lib/templates/designType";
import type { DesignTemplate, TemplateCategory } from "@/lib/templates/queries";

const EASE = [0.16, 1, 0.3, 1] as const;

export type TemplateGroup = { category: TemplateCategory; templates: DesignTemplate[] };

const CONTAINER: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const CARD: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/**
 * The DB-backed `design_templates` system (see src/lib/templates/queries.ts
 * -- the same real, already-live data the homepage and editor already use),
 * shown one representative per category so this reads as a set of complete
 * starting points rather than a dense catalog -- Artwork above is the dense
 * grid; Templates is deliberately the opposite rhythm (fewer, larger,
 * asymmetric cards) so the two sections don't blur together. Each card
 * links into the existing `/inspiration/[category]` route (unchanged query,
 * unchanged schema) for the rest of that category, rather than duplicating
 * that browsing surface here.
 *
 * `buildEditorHref`, when passed, points each card straight at the editor
 * instead -- pre-loaded with the same color its `CampaignGarment` preview
 * actually renders, rather than /inspiration/[category]'s default of
 * "browse this category first." Optional and unused unless a caller passes
 * it, so /inspiration's own behavior (browse-first) is unchanged.
 */
export function TemplatesShowcase({
  groups,
  buildEditorHref,
}: {
  groups: TemplateGroup[];
  /** Resolves a template+category to a real `/editor/new?product=...&color=...`
   * destination matching the color its preview card actually shows. */
  buildEditorHref?: (template: DesignTemplate, category: TemplateCategory) => string;
}) {
  const reduceMotion = useReducedMotion();

  if (groups.length === 0) return null;

  return (
    <section id="templates" className="scroll-mt-24 py-section" style={{ background: "var(--color-surface)" }}>
      <Container>
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex flex-col gap-2"
        >
          <span className="text-label font-semibold uppercase tracking-[0.18em] text-accent">Templates</span>
          <h2 className="font-display text-display-xl text-foreground">Complete starting points.</h2>
          <p className="max-w-md text-body-lg text-muted">
            Full compositions from the STITCH library -- customize the colors, text and placement, then make it
            yours.
          </p>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={CONTAINER}
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {groups.map(({ category, templates }, index) => {
            const template = templates[0];
            const isFeatured = index === 0;
            return (
              <motion.div key={category.id} variants={CARD} className={isFeatured ? "sm:col-span-2 lg:col-span-1 lg:row-span-2" : ""}>
                <Link
                  href={buildEditorHref ? buildEditorHref(template, category) : `/inspiration/${category.slug}`}
                  className="group flex h-full flex-col gap-5 rounded-sm border border-border bg-background p-6 transition-colors hover:border-accent"
                >
                  <div
                    className={`relative overflow-hidden rounded-sm ${isFeatured ? "aspect-[4/5]" : "aspect-square"}`}
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
                      className="absolute left-1/2 top-[6%] w-[72%] -translate-x-1/2 transition-transform duration-500 group-hover:scale-[1.04]"
                      shadowIntensity={0.8}
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <span className="text-label font-semibold uppercase tracking-[0.14em] text-muted">
                      {category.name}
                    </span>
                    <h3 className="font-display text-display-md text-foreground">{template.name}</h3>
                    <p className="mt-1 text-body-sm text-muted">
                      {templates.length} template{templates.length === 1 ? "" : "s"} in this category
                    </p>
                  </div>
                  <span className="inline-flex w-fit items-center gap-2 text-body-sm font-medium text-foreground transition-colors group-hover:text-accent">
                    Customize
                    <ArrowRight size={14} weight="bold" aria-hidden />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}
