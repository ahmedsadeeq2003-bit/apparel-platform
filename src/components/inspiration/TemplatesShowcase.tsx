"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import { Container } from "@/components/layout/Container";
import { CampaignGarment } from "@/components/apparel/CampaignGarment";
import { EDITORIAL_GARMENT_COLORS, nearestRealColorForCategory } from "@/lib/templates/garmentColors";
import { designTypeLabel } from "@/lib/templates/designType";
import { buildEditorHref } from "@/lib/editor/initialContent";
import type { DesignTemplate, TemplateCategory } from "@/lib/templates/queries";
import type { ProductColor } from "@/lib/products/queries";

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
 * -- the same real, already-live data the homepage and editor already use).
 * Two browsing modes, chosen by a category filter row (the same pattern
 * ArtworkLibrary already uses, reused rather than a second filter UI):
 *
 * "All" (default) -- one representative per category, so this reads as a
 * set of complete starting points, an overview across every style rather
 * than a dense catalog. With 18 categories now (Phase 3 added 8 style-
 * driven ones alongside the original 10 intent-driven ones), most holding
 * only one or two templates, this overview is the "curated collection"
 * framing Phase 4 asked for rather than 18 sparse single-card sections.
 *
 * A specific category -- every template in it, not just the first, so
 * picking a style is a genuine "show me everything in this vein" browse
 * instead of a dead end at one example. No database change: this is
 * purely how the same `groups` data already passed in gets displayed.
 */
export function TemplatesShowcase({
  groups,
  editorContext,
}: {
  groups: TemplateGroup[];
  editorContext?: { productSlug: string; colors: ProductColor[] };
}) {
  const reduceMotion = useReducedMotion();
  const [categorySlug, setCategorySlug] = useState<string>("all");

  function hrefFor(template: DesignTemplate, category: TemplateCategory): string {
    if (!editorContext) return `/inspiration/${category.slug}`;
    const color = nearestRealColorForCategory(category.slug, editorContext.colors) ?? editorContext.colors[0];
    if (!color) return `/inspiration/${category.slug}`;
    return buildEditorHref(editorContext.productSlug, color.id, { template: template.id });
  }

  const cards = useMemo(() => {
    if (categorySlug === "all") {
      return groups.map(({ category, templates }) => ({ category, template: templates[0], siblingCount: templates.length }));
    }
    const group = groups.find((g) => g.category.slug === categorySlug);
    if (!group) return [];
    return group.templates.map((template) => ({ category: group.category, template, siblingCount: 1 }));
  }, [groups, categorySlug]);

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

        <div className="-mx-6 mt-8 flex gap-2 overflow-x-auto px-6 pb-1 md:mx-0 md:flex-wrap md:px-0 md:pb-0">
          <button
            type="button"
            onClick={() => setCategorySlug("all")}
            aria-pressed={categorySlug === "all"}
            className={`shrink-0 rounded-full border px-4 py-2 text-body-sm font-medium uppercase tracking-wide transition-colors ${
              categorySlug === "all"
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted hover:border-accent hover:text-foreground"
            }`}
          >
            All styles
          </button>
          {groups.map(({ category }) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setCategorySlug(category.slug)}
              aria-pressed={categorySlug === category.slug}
              className={`shrink-0 rounded-full border px-4 py-2 text-body-sm font-medium uppercase tracking-wide transition-colors ${
                categorySlug === category.slug
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted hover:border-accent hover:text-foreground"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <motion.div
          key={categorySlug}
          initial={reduceMotion ? false : "hidden"}
          animate="show"
          variants={CONTAINER}
          className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {cards.map(({ category, template, siblingCount }, index) => {
            const isFeatured = categorySlug === "all" && index === 0;
            return (
              <motion.div
                key={template.id}
                variants={CARD}
                className={isFeatured ? "sm:col-span-2 lg:col-span-1 lg:row-span-2" : ""}
              >
                <Link
                  href={hrefFor(template, category)}
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
                      {categorySlug === "all"
                        ? `${siblingCount} template${siblingCount === 1 ? "" : "s"} in this style`
                        : "Editable template"}
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
