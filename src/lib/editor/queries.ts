import { createClient } from "@/lib/supabase/server";

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
