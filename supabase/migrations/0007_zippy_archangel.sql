ALTER TABLE "projects" ADD COLUMN "image_alt" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_image_alt_length" CHECK (char_length(image_alt) <= 500);