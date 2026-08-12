import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { ProductDesignSection } from "@/components/products/ProductDesignSection";
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
            <ProductDesignSection product={product} />
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
