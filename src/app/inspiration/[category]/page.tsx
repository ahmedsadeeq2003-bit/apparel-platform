import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { CategoryTemplateGrid } from "@/components/marketing/CategoryTemplateGrid";
import { getTemplatesByCategory } from "@/lib/templates/queries";

export default async function InspirationCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const result = await getTemplatesByCategory(slug);

  if (!result) {
    notFound();
  }

  const { category, templates } = result;

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Section>
          <Container>
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <h1 className="font-display text-display-xl uppercase text-foreground">
                  {category.name}
                </h1>
                <p className="mt-2 text-body-lg text-muted">
                  {templates.length} design{templates.length === 1 ? "" : "s"} to start from.
                </p>
              </div>
              <Button href="/products" variant="primary">
                Start designing
              </Button>
            </div>
            <div className="mt-12">
              {templates.length > 0 ? (
                <CategoryTemplateGrid templates={templates} />
              ) : (
                <p className="text-body text-muted">
                  No designs in this category yet.
                </p>
              )}
            </div>
          </Container>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
