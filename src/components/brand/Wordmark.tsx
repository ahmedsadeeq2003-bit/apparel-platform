import Link from "next/link";
import { BRAND_NAME } from "@/lib/brand";

export function Wordmark() {
  return (
    <Link
      href="/"
      className="font-display text-xl uppercase tracking-tight text-foreground transition-colors hover:text-accent"
    >
      {BRAND_NAME}
    </Link>
  );
}
