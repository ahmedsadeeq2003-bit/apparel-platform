"use client";

import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { TemplatePreview } from "@/components/apparel/TemplatePreview";
import type { DesignTemplate, TemplateCategory } from "@/lib/templates/queries";

export function InspirationGrid({
  featured,
}: {
  featured: { category: TemplateCategory; template: DesignTemplate }[];
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-5">
      {featured.map(({ category, template }, index) => (
        <motion.div
          key={category.id}
          className={index === 0 ? "col-span-2 row-span-2" : ""}
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link href={`/inspiration/${category.slug}`} className="group flex flex-col gap-3">
            <TemplatePreview
              canvasJson={template.canvas_json}
              hex={template.colors[0] ?? "#F4F2EC"}
              side={template.print_area === "back" ? "back" : "front"}
              label={`${template.name}, ${category.name} template`}
              className="transition-colors group-hover:border-accent/50"
            />
            <span className="flex items-center gap-1 text-body-sm text-muted transition-colors group-hover:text-foreground">
              {category.name}
              <ArrowUpRight
                className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden
              />
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
