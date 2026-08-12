"use client";

import { motion, useReducedMotion } from "motion/react";
import { TemplatePreview } from "@/components/apparel/TemplatePreview";
import type { DesignTemplate } from "@/lib/templates/queries";

export function CategoryTemplateGrid({ templates }: { templates: DesignTemplate[] }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {templates.map((template, index) => (
        <motion.div
          key={template.id}
          className="flex flex-col gap-3"
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
          <TemplatePreview
            canvasJson={template.canvas_json}
            hex={template.colors[0] ?? "#F4F2EC"}
            side={template.print_area === "back" ? "back" : "front"}
            label={template.name}
          />
          <span className="text-body-sm text-muted">{template.name}</span>
        </motion.div>
      ))}
    </div>
  );
}
