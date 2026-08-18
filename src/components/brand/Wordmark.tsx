import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";

export function Wordmark() {
  return (
    <Link
      href="/"
      className="group flex items-center gap-2.5 font-display text-xl uppercase tracking-tight text-foreground"
    >
      <span
        aria-hidden
        className="h-3.5 w-3.5 rounded-[3px] bg-accent transition-transform group-hover:scale-110"
      />
      <span className="transition-colors group-hover:text-accent">{BRAND_NAME}</span>
    </Link>
  );
}
