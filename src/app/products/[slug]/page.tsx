import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { ProductColorPicker } from "@/components/products/ProductColorPicker";
import { getProductBySlug } from "@/lib/products/queries";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Section>
          <Container>
            <div className="grid gap-12 md:grid-cols-2">
              <ProductColorPicker
                productName={product.name}
                colors={product.product_colors}
              />
              <div className="flex flex-col gap-4">
                <h1 className="font-display text-display-xl uppercase text-foreground">
                  {product.name}
                </h1>
                {product.description && (
                  <p className="max-w-md text-body-lg text-muted">
                    {product.description}
                  </p>
                )}
                <span
                  aria-disabled
                  className="mt-2 inline-flex min-h-11 w-fit items-center justify-center rounded-full border border-border px-6 text-body font-medium text-muted"
                >
                  Design this shirt — coming soon
                </span>
              </div>
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
