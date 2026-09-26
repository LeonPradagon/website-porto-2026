ALTER TABLE "projects" ADD COLUMN "role" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "year" integer;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "demo_url" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "featured" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_role_length" CHECK (char_length(role) <= 200);--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_year_valid" CHECK (year is null or year between 1990 and 2100);--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_demo_url_valid" CHECK (demo_url is null or demo_url ~ '^https://');
--> statement-breakpoint
REVOKE ALL ON public.media_assets FROM PUBLIC, anon;
GRANT SELECT ON public.media_assets TO anon;
