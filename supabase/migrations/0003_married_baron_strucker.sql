CREATE TABLE "contact_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone,
	CONSTRAINT "contact_messages_name_length" CHECK (char_length(name) between 1 and 100),
	CONSTRAINT "contact_messages_email_length" CHECK (char_length(email) between 3 and 254),
	CONSTRAINT "contact_messages_body_length" CHECK (char_length(message) between 1 and 4000)
);
--> statement-breakpoint
ALTER TABLE "contact_messages" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "contact_rate_limits" (
	"key_hash" text PRIMARY KEY NOT NULL,
	"window_started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"request_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contact_rate_limits" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
REVOKE ALL ON public.contact_messages, public.contact_rate_limits FROM public, anon, authenticated;
