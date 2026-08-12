import { createClient } from "@/lib/supabase/server";

export type ProductColor = {
  id: string;
  name: string;
  hex: string;
  front_mockup_url: string | null;
  back_mockup_url: string | null;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  product_colors: ProductColor[];
};

const PRODUCT_SELECT =
  "id, slug, name, description, product_colors(id, name, hex, front_mockup_url, back_mockup_url, is_active)";

export async function getActiveProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .eq("product_colors.is_active", true);

  if (error) {
    throw error;
  }

  return (data ?? []) as unknown as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .eq("product_colors.is_active", true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as unknown as Product | null;
}
