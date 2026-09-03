import { createClient } from "@/lib/supabase/server";

export type SavedDesignDetail = {
  id: string;
  name: string;
  productSlug: string;
  productColorId: string;
  frontCanvasJson: object | null;
  backCanvasJson: object | null;
};

/**
 * One saved design, by id, for resuming it in the editor. Relies entirely
 * on `designs_select_own` (see the designs-schema migration) for
 * authorization -- no explicit `user_id` check here, same reasoning as
 * `getMyDesigns`. A design that doesn't exist *or* belongs to someone else
 * both come back as `null` rather than distinguishable errors, which is the
 * correct behavior here (not just convenient): it never reveals to a caller
 * whether a given id belongs to another user's design.
 *
 * Joins `products(slug)` so the caller (app/editor/new/page.tsx) can feed
 * the result straight into the existing `getProductBySlug` path rather than
 * needing a second, parallel "load a product by id" query -- reusing the
 * one real product-resolution system instead of adding another.
 */
export async function getDesignById(id: string): Promise<SavedDesignDetail | null> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("designs")
      .select("id, name, product_color_id, front_canvas_json, back_canvas_json, products(slug)")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const product = Array.isArray(data.products) ? data.products[0] : data.products;
    const productSlug = product?.slug;
    if (!productSlug) return null;

    return {
      id: data.id,
      name: data.name,
      productSlug,
      productColorId: data.product_color_id,
      frontCanvasJson: data.front_canvas_json,
      backCanvasJson: data.back_canvas_json,
    };
  } catch (error) {
    // A malformed id (e.g. not a valid uuid, from a mistyped/old link) makes
    // Postgres reject the query outright rather than returning zero rows --
    // treat that identically to "not found" rather than failing the page.
    console.error("getDesignById failed", error);
    return null;
  }
}

export type SavedDesign = {
  id: string;
  name: string;
  productColorId: string;
  frontCanvasJson: object | null;
  backCanvasJson: object | null;
};

/**
 * The current signed-in customer's own saved designs (see actions.ts's
 * `saveDesign`), most recently updated first. Row-level security
 * (`designs_select_own`, see the designs-schema migration) already
 * restricts this table to rows the caller owns -- no explicit `user_id`
 * filter is added here, the same reliance on RLS as the rest of this app's
 * authenticated reads (see CLAUDE.md: "RLS is the real security boundary").
 * Returns `[]` for a signed-out caller rather than erroring, though every
 * current call site is already behind its own auth gate.
 */
export async function getMyDesigns(limit = 8): Promise<SavedDesign[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("designs")
    .select("id, name, product_color_id, front_canvas_json, back_canvas_json")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    productColorId: row.product_color_id,
    frontCanvasJson: row.front_canvas_json,
    backCanvasJson: row.back_canvas_json,
  }));
}
