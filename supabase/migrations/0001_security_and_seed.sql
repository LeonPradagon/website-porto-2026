-- Custom SQL migration file, put your code below! --
create or replace function public.is_site_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.site_admins where user_id = (select auth.uid())
  );
$$;
--> statement-breakpoint
revoke all on function public.is_site_admin() from public;
--> statement-breakpoint
grant execute on function public.is_site_admin() to anon, authenticated;
--> statement-breakpoint
revoke all on public.site_admins, public.projects from anon, authenticated;
--> statement-breakpoint
grant select on public.site_admins to authenticated;
--> statement-breakpoint
grant select on public.projects to anon, authenticated;
--> statement-breakpoint
grant insert, update, delete on public.projects to authenticated;
--> statement-breakpoint
create policy "Admins can read their own membership"
on public.site_admins for select to authenticated
using (user_id = (select auth.uid()));
--> statement-breakpoint
create policy "Published projects are public; admins can read drafts"
on public.projects for select to anon, authenticated
using (status = 'published' or (select public.is_site_admin()));
--> statement-breakpoint
create policy "Admins can create projects"
on public.projects for insert to authenticated
with check ((select public.is_site_admin()));
--> statement-breakpoint
create policy "Admins can update projects"
on public.projects for update to authenticated
using ((select public.is_site_admin()))
with check ((select public.is_site_admin()));
--> statement-breakpoint
create policy "Admins can delete projects"
on public.projects for delete to authenticated
using ((select public.is_site_admin()));
--> statement-breakpoint
insert into public.projects (slug, title, category, description, stack, image_url, repository_url, editorial, status, sort_order)
values
  ('acs', 'ACS — Asisgo Core Sovereign', 'Professional', 'Asisten AI perusahaan dengan RAG, respons LLM real-time, ruang analisis, semantic graph, dan CMS dokumen.', array['Next.js', 'Express', 'Python', 'PostgreSQL'], '/assets/projects/acs.jpg', 'https://github.com/LeonPradagon/acs', false, 'published', 1),
  ('aksara-cakra', 'Aksara Cakra', 'Professional', 'Website profil perusahaan yang responsif untuk layanan, portofolio, informasi, dan kontak.', array['Next.js', 'React', 'Express', 'Tailwind'], '/assets/projects/aksara.jpg', 'https://github.com/LeonPradagon/aksara', false, 'published', 2),
  ('rebuilt-durasi', 'Rebuilt Durasi', 'Professional', 'Platform whistleblowing untuk laporan internal dan eksternal yang aman.', array['Next.js', 'Express', 'Bootstrap', 'SQL Server'], '/assets/projects/rebuilt-durasi-cinematic.jpg', 'https://github.com/LeonPradagon/Rebuilt-Durasi', true, 'published', 3),
  ('idip', 'IDIP', 'Professional', 'Platform intelijen data dengan SSO, CMS, portal layanan publik, dan dashboard analitik.', array['React.js', 'Spring Boot', 'Tailwind', 'SQL Server'], '/assets/projects/idip-cinematic.jpg', 'https://github.com/LeonPradagon/IDIP', true, 'published', 4),
  ('tnde', 'TNDE', 'Professional', 'Sistem naskah dinas elektronik untuk alur administrasi, arsip, dan korespondensi internal.', array['Handlebars', 'Express', 'Tailwind CSS', 'PostgreSQL'], '/assets/projects/tnde-cinematic.jpg', 'https://github.com/LeonPradagon/TNDE', true, 'published', 5),
  ('monitoring-expenses', 'Monitoring Expenses', 'Personal', 'Aplikasi untuk mencatat dan memvisualisasikan pengeluaran harian.', array['TypeScript', 'Next.js', 'Tailwind'], '/assets/projects/monitoring-expenses.jpg', 'https://github.com/LeonPradagon/monitoring-expenses', false, 'published', 6),
  ('streaming-platform', 'Streaming Platform', 'Personal', 'Eksplorasi antarmuka platform streaming dengan fokus pada penyajian media yang cepat.', array['Next.js', 'Tailwind', 'Video.js'], '/assets/projects/netix.jpg', 'https://github.com/LeonPradagon/Streaming-platform', false, 'published', 7)
on conflict (slug) do nothing;
--> statement-breakpoint
-- Setelah membuat akun admin di Supabase Auth, daftarkan ID-nya sekali:
-- insert into public.site_admins (user_id) values ('<AUTH_USER_UUID>');
