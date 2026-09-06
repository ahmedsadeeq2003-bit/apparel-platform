import { ACCEPTED_UPLOAD_TYPES, MAX_UPLOAD_BYTES } from "@/lib/editor/constants";

export type UploadValidationResult = { ok: true } | { ok: false; message: string };

/** Pure, framework-agnostic checks on a File's type/size -- kept separate
 * from useDesignEditor.ts's canvas-touching addImageFromFile so it's
 * unit-testable without mounting Fabric, per this project's convention that
 * business logic in src/lib gets direct Vitest coverage. Dimension
 * validation isn't done here since it requires actually decoding the file
 * (an async, canvas/Image-dependent step) -- that stays in the hook. */
export function validateUpload(file: File): UploadValidationResult {
  const acceptedTypes: readonly string[] = ACCEPTED_UPLOAD_TYPES;
  if (!acceptedTypes.includes(file.type)) {
    return { ok: false, message: "Please upload a PNG, JPG, WebP, or SVG file." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, message: `File is too large. Please upload something under ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB.` };
  }
  return { ok: true };
}
