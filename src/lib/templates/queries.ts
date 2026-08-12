import { createClient } from "@/lib/supabase/server";

export type TemplateCategory = {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
};

export type TemplatePrintArea = "front" | "back" | "front_and_back";

export type DesignTemplate = {
  id: string;
  category_id: string;
  name: string;
  design_type: string;
  print_area: TemplatePrintArea;
  canvas_json: object;
  back_canvas_json: object | null;
  colors: string[];
  tags: string[];
};

const CATEGORY_SELECT = "id, slug, name, sort_order";
const TEMPLATE_SELECT =
  "id, category_id, name, design_type, print_area, canvas_json, back_canvas_json, colors, tags";

export async function getActiveCategories(): Promise<TemplateCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("template_categories")
    .select(CATEGORY_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as TemplateCategory[];
}

export async function getTemplatesByCategory(
  categorySlug: string,
): Promise<{ category: TemplateCategory; templates: DesignTemplate[] } | null> {
  const supabase = await createClient();

  const { data: category, error: categoryError } = await supabase
    .from("template_categories")
    .select(CATEGORY_SELECT)
    .eq("slug", categorySlug)
    .eq("is_active", true)
    .maybeSingle();

  if (categoryError) {
    throw categoryError;
  }
  if (!category) {
    return null;
  }

  const { data: templates, error: templatesError } = await supabase
    .from("design_templates")
    .select(TEMPLATE_SELECT)
    .eq("category_id", category.id)
    .eq("is_active", true);

  if (templatesError) {
    throw templatesError;
  }

  return {
    category: category as TemplateCategory,
    templates: (templates ?? []) as DesignTemplate[],
  };
}

/** One template per category, for the homepage inspiration section. */
export async function getFeaturedTemplates(): Promise<
  { category: TemplateCategory; template: DesignTemplate }[]
> {
  const supabase = await createClient();

  const { data: categories, error: categoryError } = await supabase
    .from("template_categories")
    .select(CATEGORY_SELECT)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (categoryError) {
    throw categoryError;
  }

  const { data: templates, error: templatesError } = await supabase
    .from("design_templates")
    .select(TEMPLATE_SELECT)
    .eq("is_active", true);

  if (templatesError) {
    throw templatesError;
  }

  const featured: { category: TemplateCategory; template: DesignTemplate }[] = [];
  for (const category of (categories ?? []) as TemplateCategory[]) {
    const template = (templates ?? []).find(
      (t) => t.category_id === category.id,
    ) as DesignTemplate | undefined;
    if (template) {
      featured.push({ category, template });
    }
  }

  return featured;
}
