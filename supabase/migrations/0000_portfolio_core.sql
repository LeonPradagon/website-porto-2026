CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"category" text NOT NULL,
	"description" text NOT NULL,
	"stack" text[] DEFAULT '{}'::text[] NOT NULL,
	"image_url" text NOT NULL,
	"repository_url" text NOT NULL,
	"editorial" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug"),
	CONSTRAINT "projects_slug_format" CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
	CONSTRAINT "projects_category_valid" CHECK (category in ('Professional', 'Personal')),
	CONSTRAINT "projects_status_valid" CHECK (status in ('draft', 'published')),
	CONSTRAINT "projects_image_url_valid" CHECK (image_url ~ '^(https://|/assets/)'),
	CONSTRAINT "projects_repository_url_valid" CHECK (repository_url ~ '^https://')
);
--> statement-breakpoint
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "site_admins" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "site_admins" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "site_admins" ADD CONSTRAINT "site_admins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
