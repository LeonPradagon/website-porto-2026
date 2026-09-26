ALTER TABLE "projects" DROP CONSTRAINT "projects_slug_format";--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_category_valid";--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_status_valid";--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_image_url_valid";--> statement-breakpoint
ALTER TABLE "projects" DROP CONSTRAINT "projects_repository_url_valid";--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_slug_format" CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_category_valid" CHECK (category in ('Professional', 'Personal'));--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_status_valid" CHECK (status in ('draft', 'published'));--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_image_url_valid" CHECK (image_url ~ '^(https://|/assets/)');--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_repository_url_valid" CHECK (repository_url ~ '^https://');