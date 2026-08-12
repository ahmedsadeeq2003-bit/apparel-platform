import type { ReactNode } from "react";

const TONE_CLASSES = {
  base: "bg-background",
  raised: "bg-surface",
} as const;

export function Section({
  children,
  id,
  tone = "base",
  className = "",
}: {
  children: ReactNode;
  id?: string;
  tone?: keyof typeof TONE_CLASSES;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`py-section ${TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </section>
  );
}
