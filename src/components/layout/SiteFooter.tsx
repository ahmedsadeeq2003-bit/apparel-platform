import { Wordmark } from "@/components/brand/Wordmark";
import { Container } from "@/components/layout/Container";
import { BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <Container>
        <div className="flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <Wordmark />
            <p className="text-body-sm text-muted">{BRAND_TAGLINE}</p>
          </div>
          <div className="flex flex-col gap-2 text-body-sm text-muted md:items-end">
            {/* route ships in M7 */}
            <a
              href="/business"
              className="transition-colors hover:text-foreground"
            >
              Outfitting a team or business? Get a quote →
            </a>
            <p>
              © {year} {BRAND_NAME}
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
