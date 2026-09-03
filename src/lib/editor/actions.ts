"use server";

import { createClient } from "@/lib/supabase/server";

export type SaveDesignInput = {
  /** Present once a design has been saved at least once this session (a
   * fresh insert's returned id, or a designId the editor was opened with) --
   * routes this call to an update instead of a second insert. Absent for a
   * design that has never been saved before. */
  designId?: string;
  productId: string;
  productColorId: string;
  name: string;
  frontCanvasJson: object | null;
  backCanvasJson: object | null;
};

export async function saveDesign(
  input: SaveDesignInput,
): Promise<{ error: string } | { success: true; id: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sign in to save your design." };
  }

  if (input.designId) {
    // designs_update_own (see the designs-schema migration) already scopes
    // this to rows the caller owns -- no explicit user_id check needed, and
    // an id that doesn't exist or isn't the caller's own simply updates zero
    // rows rather than silently succeeding against someone else's design.
    const { data, error } = await supabase
      .from("designs")
      .update({
        product_id: input.productId,
        product_color_id: input.productColorId,
        name: input.name || "Untitled design",
        front_canvas_json: input.frontCanvasJson,
        back_canvas_json: input.backCanvasJson,
      })
      .eq("id", input.designId)
      .select("id")
      .maybeSingle();

    if (error) {
      return { error: error.message };
    }
    if (!data) {
      return { error: "Couldn't update this design. It may no longer exist." };
    }
    return { success: true, id: data.id };
  }

  const { data, error } = await supabase
    .from("designs")
    .insert({
      user_id: user.id,
      product_id: input.productId,
      product_color_id: input.productColorId,
      name: input.name || "Untitled design",
      front_canvas_json: input.frontCanvasJson,
      back_canvas_json: input.backCanvasJson,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  return { success: true, id: data.id };
}
