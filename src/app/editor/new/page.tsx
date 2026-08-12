import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProductBySlug } from "@/lib/products/queries";
import { EditorShellLoader } from "@/components/editor/EditorShellLoader";

export default async function NewDesignPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; color?: string }>;
}) {
  const { product: slug, color: colorId } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  if (!slug) {
    redirect("/products");
  }

  const product = await getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  const initialColor =
    product.product_colors.find((color) => color.id === colorId) ??
    product.product_colors[0];
  if (!initialColor) {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <EditorShellLoader product={product} initialColor={initialColor} />
    </main>
  );
}
