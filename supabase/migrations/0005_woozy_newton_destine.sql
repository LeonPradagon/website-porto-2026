CREATE POLICY "Public can read site settings" ON "site_settings" AS PERMISSIVE FOR SELECT TO "anon", "authenticated" USING (true);
--> statement-breakpoint
GRANT SELECT ON public.site_settings TO anon, authenticated;
