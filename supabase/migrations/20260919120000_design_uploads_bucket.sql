-- Phase 2 (Customer Artwork Upload): a private Supabase Storage bucket for
-- customer-uploaded RASTER artwork (PNG/JPG/WebP).
--
-- WHY: addImageFromFile (src/hooks/useDesignEditor.ts) previously embedded
-- an uploaded raster image directly as a base64 data: URL inside the Fabric
-- object's own `src` property, which round-tripped through
-- designs.front_canvas_json/back_canvas_json (jsonb) untouched -- correct
-- for save/resume, but not appropriate at production scale: a single 10MB
-- upload becomes a ~13MB base64 string baked into one jsonb column value on
-- every save. This bucket stores the raw file instead; the Fabric object
-- keeps only a `sourcePath` reference inside canvas_json (see
-- src/lib/editor/uploadStorage.ts), and the editor re-resolves that path to
-- a fresh signed URL every time a saved design is reopened.
--
-- SVG uploads never use this bucket -- they're parsed (after sanitization,
-- see src/lib/editor/sanitizeSvg.ts) into real vector Fabric objects
-- (Path/Group), which already serialize as structured, reasonably-sized
-- JSON with no blob to store, the same way the artwork library's own SVGs
-- already do.
--
-- Private, not public: the bucket must never serve an object to an
-- unauthenticated request or another customer's session. RLS on
-- storage.objects (Supabase's own per-bucket security boundary) enforces
-- "an authenticated user may only read/write objects under their own
-- auth.uid() folder" -- the exact same auth.uid() boundary every RLS policy
-- elsewhere in this project already relies on (CLAUDE.md: "RLS is the real
-- security boundary"), applied here to Storage for the first time.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'design-uploads',
  'design-uploads',
  false,
  10485760, -- 10MB, matches MAX_UPLOAD_BYTES (src/lib/editor/constants.ts)
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

-- `storage.foldername(name)` splits an object's path on "/" -- with the
-- upload path shape `${userId}/${uuid}.${ext}` (see uploadDesignImage in
-- uploadStorage.ts), `(storage.foldername(name))[1]` is that first `userId`
-- segment. This is Supabase's own documented pattern for a per-user-folder
-- private bucket.
create policy design_uploads_select_own
  on storage.objects for select
  to authenticated
  using (bucket_id = 'design-uploads' and (select auth.uid())::text = (storage.foldername(name))[1]);

create policy design_uploads_insert_own
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'design-uploads' and (select auth.uid())::text = (storage.foldername(name))[1]);

create policy design_uploads_delete_own
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'design-uploads' and (select auth.uid())::text = (storage.foldername(name))[1]);
