import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { ProductCard } from "@/components/products/ProductCard";
import { getActiveProducts } from "@/lib/products/queries";

export default async function ProductsPage() {
  const products = await getActiveProducts();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Section>
          <Container>
            <h1 className="font-display text-display-xl uppercase text-foreground">
              Shirts
            </h1>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
