"use client";

import { createClient } from "@/lib/supabase/client";

/** Private Supabase Storage bucket for customer-uploaded raster artwork --
 * see the design-uploads-bucket migration for the RLS policies that scope
 * every object to its owner's own `${userId}/` folder, the same `auth.uid()`
 * boundary every other table in this project already relies on (CLAUDE.md:
 * "RLS is the real security boundary"). SVG uploads never touch this bucket
 * -- they're parsed into real vector Fabric objects (see sanitizeSvg.ts +
 * useDesignEditor.ts), which already serialize as structured JSON with no
 * blob to store. */
export const DESIGN_UPLOADS_BUCKET = "design-uploads";

/** How long a signed URL stays valid. Long enough to cover one full editing
 * session without needing a mid-session refresh; the one place that DOES
 * need a fresh one is resuming a saved design later (see
 * getSignedDesignImageUrls below and its call site in useDesignEditor.ts),
 * since whatever signed URL got baked into canvas_json at save time has
 * almost certainly expired by the time the design is reopened. */
const SIGNED_URL_TTL_SECONDS = 60 * 60;

function extensionFor(mimeType: string): string {
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

export type UploadedDesignImage = { path: string; signedUrl: string };

/**
 * Uploads one customer raster file to their own private folder and returns
 * both the durable storage path -- stored on the Fabric object as
 * `sourcePath` and round-tripped through canvas_json, see useDesignEditor.ts
 * -- and a signed URL usable immediately to render it on the live canvas.
 * Throws a plain user-facing message on failure (matches every other
 * rejection path in addImageFromFile) rather than a raw Supabase error.
 */
export async function uploadDesignImage(file: File, userId: string): Promise<UploadedDesignImage> {
  const supabase = createClient();
  const path = `${userId}/${crypto.randomUUID()}.${extensionFor(file.type)}`;

  const { error: uploadError } = await supabase.storage
    .from(DESIGN_UPLOADS_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) {
    throw new Error("Couldn't upload that image. Please try again.");
  }

  const { data, error: signError } = await supabase.storage
    .from(DESIGN_UPLOADS_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (signError || !data) {
    throw new Error("Uploaded, but couldn't load a preview. Please try again.");
  }

  return { path, signedUrl: data.signedUrl };
}

/**
 * Re-resolves fresh signed URLs for a batch of storage paths -- used once,
 * right after a saved design's canvas_json is loaded onto the canvas (see
 * useDesignEditor.ts's hydration effect), since every signed URL inside
 * that loaded JSON was only ever valid for SIGNED_URL_TTL_SECONDS from
 * whenever the design was last saved. Uses `createSignedUrls` (one request
 * for the whole batch) rather than one `createSignedUrl` call per image.
 * Paths that fail to re-sign (e.g. the file was somehow removed) are simply
 * absent from the returned map -- the caller leaves that one image's
 * existing (stale) src alone rather than failing the whole hydration.
 */
export async function getSignedDesignImageUrls(paths: string[]): Promise<Map<string, string>> {
  if (paths.length === 0) return new Map();

  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(DESIGN_UPLOADS_BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);

  const result = new Map<string, string>();
  if (error || !data) return result;
  for (const entry of data) {
    if (entry.path && entry.signedUrl && !entry.error) {
      result.set(entry.path, entry.signedUrl);
    }
  }
  return result;
}
