CREATE TABLE "site_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"role_id" text NOT NULL,
	"role_en" text NOT NULL,
	"hero_title_id" text NOT NULL,
	"hero_title_en" text NOT NULL,
	"hero_description_id" text NOT NULL,
	"hero_description_en" text NOT NULL,
	"about_id" text NOT NULL,
	"about_en" text NOT NULL,
	"seo_description_id" text NOT NULL,
	"seo_description_en" text NOT NULL,
	"contact_email" text NOT NULL,
	"github_url" text NOT NULL,
	"linkedin_url" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "site_settings_singleton" CHECK (id = 1)
);
--> statement-breakpoint
ALTER TABLE "site_settings" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
REVOKE ALL ON public.site_settings FROM public, anon, authenticated;
--> statement-breakpoint
INSERT INTO public.site_settings (
  id, role_id, role_en, hero_title_id, hero_title_en, hero_description_id, hero_description_en,
  about_id, about_en, seo_description_id, seo_description_en, contact_email, github_url, linkedin_url
) VALUES (
  1,
  'Full-stack developer',
  'Full-stack developer',
  E'Membangun\naplikasi web\ndan sistem digital.',
  E'Building\nweb applications\nand digital systems.',
  'Saya mengembangkan aplikasi web, API, dan integrasi AI—dari antarmuka hingga basis data—untuk kebutuhan produk dan sistem perusahaan.',
  'I build web applications, APIs, and AI integrations—from user interfaces to databases—for digital products and business systems.',
  'Saya adalah full-stack developer dengan pengalaman lebih dari dua tahun membangun aplikasi web dan sistem perusahaan. Saya mengerjakan antarmuka, backend, API, dan integrasi AI, serta saat ini berkontribusi pada inisiatif digital di PT Asia Sistem Indonesia.',
  'I am a full-stack developer with over two years of experience building web applications and business systems. I work across frontend, backend, APIs, and AI integrations, and currently contribute to digital initiatives at PT Asia Sistem Indonesia.',
  'Portofolio Jhansen Wilson, full-stack developer dengan pengalaman membangun aplikasi web, REST API, sistem perusahaan, dan integrasi AI.',
  'Portfolio of Jhansen Wilson, a full-stack developer building web applications, REST APIs, business systems, and AI integrations.',
  'jhansen.wilson@gmail.com',
  'https://github.com/LeonPradagon',
  'https://www.linkedin.com/in/jahnsen/'
);
