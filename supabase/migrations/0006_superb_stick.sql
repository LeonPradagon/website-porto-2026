CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"storage_path" text NOT NULL,
	"public_url" text NOT NULL,
	"media_type" text NOT NULL,
	"mime_type" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"alt_text" text NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_assets_storage_path_unique" UNIQUE("storage_path"),
	CONSTRAINT "media_assets_public_url_unique" UNIQUE("public_url"),
	CONSTRAINT "media_assets_type_valid" CHECK (media_type in ('image', 'video')),
	CONSTRAINT "media_assets_mime_valid" CHECK (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm')),
	CONSTRAINT "media_assets_size_valid" CHECK (size_bytes between 1 and 52428800),
	CONSTRAINT "media_assets_alt_length" CHECK (char_length(alt_text) between 1 and 500)
);
--> statement-breakpoint
ALTER TABLE "media_assets" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "Public can read media metadata" ON "media_assets" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (true);--> statement-breakpoint
CREATE POLICY "Admins can add media metadata" ON "media_assets" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select public.is_site_admin()));--> statement-breakpoint
CREATE POLICY "Admins can update media metadata" ON "media_assets" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select public.is_site_admin())) WITH CHECK ((select public.is_site_admin()));--> statement-breakpoint
CREATE POLICY "Admins can delete media metadata" ON "media_assets" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select public.is_site_admin()));
--> statement-breakpoint
GRANT SELECT ON public.media_assets TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.media_assets TO authenticated;
--> statement-breakpoint
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-media',
  'portfolio-media',
  true,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm']::text[]
)
ON CONFLICT (id) DO NOTHING;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets
    WHERE id = 'portfolio-media'
      AND public = true
      AND file_size_limit = 52428800
      AND allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm']::text[]
  ) THEN
    RAISE EXCEPTION 'portfolio-media bucket exists with unexpected configuration';
  END IF;
END $$;
--> statement-breakpoint
CREATE POLICY "Admins can upload portfolio media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'portfolio-media' AND (select public.is_site_admin()));
--> statement-breakpoint
CREATE POLICY "Admins can update portfolio media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'portfolio-media' AND (select public.is_site_admin()))
  WITH CHECK (bucket_id = 'portfolio-media' AND (select public.is_site_admin()));
--> statement-breakpoint
CREATE POLICY "Admins can delete portfolio media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'portfolio-media' AND (select public.is_site_admin()));
