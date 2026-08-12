import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-sm border border-border bg-surface ${className}`}
    >
      {children}
    </div>
  );
}
