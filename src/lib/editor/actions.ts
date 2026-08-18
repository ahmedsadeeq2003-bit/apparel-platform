"use server";

import { createClient } from "@/lib/supabase/server";

export type SaveDesignInput = {
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
