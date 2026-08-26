import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { GrainOverlay } from "@/components/marketing/GrainOverlay";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/Button";
import { CategoryTemplateGrid } from "@/components/marketing/CategoryTemplateGrid";
import { getTemplatesByCategory } from "@/lib/templates/queries";

/** Same `.theme-editorial` treatment as /inspiration and the homepage (see
 * tokens.css). Data layer (`getTemplatesByCategory`) is unchanged -- only
 * the presentation was brought into the redesigned system. */
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
    <div className="theme-editorial bg-background text-foreground">
      <GrainOverlay />
      <SiteHeader />
      <main className="flex-1">
        <Section>
          <Container>
            <Link
              href="/inspiration#templates"
              className="text-body-sm font-medium text-muted underline underline-offset-4 hover:text-foreground"
            >
              &larr; Back to Inspiration
            </Link>
            <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
              <div>
                <h1 className="font-display text-display-xl text-foreground">{category.name}</h1>
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
    </div>
  );
}
