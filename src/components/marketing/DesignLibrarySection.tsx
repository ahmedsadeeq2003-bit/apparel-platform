import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { InspirationGrid } from "@/components/marketing/InspirationGrid";
import { getFeaturedTemplates } from "@/lib/templates/queries";
import { designAssets, type DesignCategory } from "@/lib/assets/manifest";

/** One hand-picked real piece per design-library category -- a taste of the
 * full library (60+ SVGs across six categories), not a dump of every asset.
 * Slugs are real entries from src/lib/assets/manifest.ts. */
const CURATED_ARTWORK: { category: DesignCategory; slug: string }[] = [
  { category: "typography", slug: "good-energy" },
  { category: "graffiti", slug: "street-flame" },
  { category: "illustration", slug: "botanical-flower" },
  { category: "abstract", slug: "abstract-loop" },
  { category: "minimal", slug: "tiny-star" },
  { category: "graphic-art", slug: "retro-sun" },
];

const CATEGORY_LABELS: Record<DesignCategory, string> = {
  typography: "Typography",
  graffiti: "Graffiti",
  illustration: "Illustration",
  abstract: "Abstract",
  minimal: "Minimal",
  "graphic-art": "Graphic Art",
};

/** The artwork-library half of "start from something": real SVGs from the
 * design library (six categories) plus real DB-backed starter templates,
 * both leading to /inspiration to browse the rest. Distinct from
 * FreshOffThePress below -- this is the STITCH-authored library, not
 * customer work. */
export async function DesignLibrarySection() {
  const featured = await getFeaturedTemplates();

  return (
    <Section>
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-label font-semibold uppercase tracking-[0.18em] text-accent">
              The design library
            </span>
            <h2 className="mt-3 font-display text-display-xl text-foreground">
              60+ Pieces of Art, Ready to Wear
            </h2>
          </div>
          <Link
            href="/inspiration"
            className="text-body-sm font-medium text-foreground underline underline-offset-4 transition-colors hover:text-accent"
          >
            Browse the full library
          </Link>
        </div>

        <ul className="mt-10 grid grid-cols-3 gap-4 sm:grid-cols-6">
          {CURATED_ARTWORK.map(({ category, slug }) => {
            const entry = designAssets[category].find((asset) => asset.path.endsWith(`/${slug}.svg`));
            if (!entry) return null;
            return (
              <li key={entry.id} className="flex flex-col items-center gap-2 text-center">
                <span className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-sm border border-border bg-surface p-5">
                  {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size static SVG from the design library */}
                  <img src={entry.path} alt={entry.name ?? ""} className="h-full w-full object-contain" />
                </span>
                <span className="text-[0.7rem] font-medium uppercase tracking-[0.08em] text-muted">
                  {CATEGORY_LABELS[category]}
                </span>
              </li>
            );
          })}
        </ul>

        {featured.length > 0 && (
          <div className="mt-16">
            <p className="text-body-sm font-medium uppercase tracking-[0.1em] text-muted">
              Or start from a finished template
            </p>
            <div className="mt-6">
              <InspirationGrid featured={featured.slice(0, 4)} />
            </div>
          </div>
        )}
      </Container>
    </Section>
  );
}
