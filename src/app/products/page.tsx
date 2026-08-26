import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { GrainOverlay } from "@/components/marketing/GrainOverlay";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { ProductsHero } from "@/components/products/ProductsHero";
import { ProductCard } from "@/components/products/ProductCard";
import { getActiveProducts } from "@/lib/products/queries";

/** Same `.theme-editorial` treatment as the homepage (see tokens.css --
 * this page is the one this session's redesign pass brings into that
 * system; the design editor stays on the separate dark theme for now).
 * `products.map` rather than a single hardcoded showcase so a second real
 * product (oversized-tee, hoodie, sweatshirt) gets its own section the
 * moment it exists in the DB, without inventing one today. */
export default async function ProductsPage() {
  const products = await getActiveProducts();

  return (
    <div className="theme-editorial bg-background text-foreground">
      <GrainOverlay />
      <SiteHeader />
      <main className="flex-1">
        <ProductsHero />
        <Section>
          <Container>
            <div className="flex flex-col gap-24">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </div>
  );
}
