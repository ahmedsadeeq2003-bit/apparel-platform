import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { getComingSoonGarments } from "@/lib/products/garments";

/**
 * Phase 3 (Garment Catalog): an honest preview of where STITCH's garment
 * catalog is headed, sitting below the real, orderable products
 * `/products/page.tsx` already renders from `getActiveProducts()`. These
 * three cards are NOT products -- no `products` row, no real photo, no
 * "Design yours" link into the editor (see garments.ts's own comment on
 * why). They exist so the roadmap is visible rather than hidden, without
 * ever claiming a garment is ready before it actually is.
 *
 * Renders nothing at all once every catalog garment has a real product
 * (getComingSoonGarments() returns []), rather than showing an empty
 * section header -- the honest state for "nothing coming soon anymore" is
 * no section, not an empty one.
 */
export function GarmentCatalogSection() {
  const comingSoon = getComingSoonGarments();
  if (comingSoon.length === 0) return null;

  return (
    <Section tone="raised">
      <Container>
        <div className="flex flex-col gap-2">
          <span className="text-label font-semibold uppercase tracking-[0.18em] text-accent">
            The catalog is growing
          </span>
          <h2 className="font-display text-display-xl text-foreground">More garments, coming soon.</h2>
          <p className="max-w-md text-body-lg text-muted">
            Real photography and fit for each of these is in progress -- they&apos;ll design in the same studio the
            Classic Tee already does the moment they&apos;re ready.
          </p>
        </div>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {comingSoon.map((garment) => (
            <li
              key={garment.slug}
              aria-label={`${garment.name} -- coming soon`}
              className="flex flex-col gap-3 rounded-sm border border-dashed border-border bg-background/60 p-6"
            >
              <span className="w-fit rounded-full border border-border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">
                Coming soon
              </span>
              <h3 className="font-display text-display-md text-foreground/70">{garment.name}</h3>
              <p className="text-body-sm text-muted">{garment.description}</p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
