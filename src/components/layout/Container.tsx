import type { ReactNode } from "react";

export function Container({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-7xl px-6 md:px-10">{children}</div>;
}
