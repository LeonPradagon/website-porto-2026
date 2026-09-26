CREATE TABLE "admin_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid NOT NULL,
	"actor_email" text NOT NULL,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "admin_audit_logs_action_length" CHECK (char_length(action) between 1 and 100),
	CONSTRAINT "admin_audit_logs_entity_length" CHECK (char_length(entity) between 1 and 80),
	CONSTRAINT "admin_audit_logs_actor_email_length" CHECK (char_length(actor_email) between 3 and 254)
);
--> statement-breakpoint
ALTER TABLE "admin_audit_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "site_admins" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "site_admins" ADD COLUMN "role" text DEFAULT 'admin' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_admins" ADD CONSTRAINT "site_admins_role_valid" CHECK (role in ('owner', 'admin'));
--> statement-breakpoint
UPDATE public.site_admins
SET role = 'owner'
WHERE user_id = (
  SELECT user_id FROM public.site_admins ORDER BY created_at, user_id LIMIT 1
)
AND NOT EXISTS (SELECT 1 FROM public.site_admins WHERE role = 'owner');
--> statement-breakpoint
REVOKE ALL ON public.admin_audit_logs FROM PUBLIC, anon, authenticated;
