import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { InspirationGrid } from "@/components/marketing/InspirationGrid";
import { CuratedArtworkGrid } from "@/components/marketing/CuratedArtworkGrid";
import { getFeaturedTemplates } from "@/lib/templates/queries";

/** The artwork-library half of "start from something": real SVGs from the
 * design library (six categories, animated in CuratedArtworkGrid) plus real
 * DB-backed starter templates, both leading to /inspiration to browse the
 * rest. Distinct from FreshOffThePress below -- this is the STITCH-authored
 * library, not customer work. */
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

        <CuratedArtworkGrid />

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
