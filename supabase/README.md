# Supabase setup

1. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_DB_URL`. The publishable key is expected to be visible in the browser; access is restricted by RLS. `SUPABASE_DB_URL` is a server-side secret; use the Session pooler connection string from Supabase Connect (port 5432) for migrations.
2. Run `npm run db:migrate`. Drizzle applies the tracked migrations in order; they create the project table, admin membership table, RLS rules, and seed the current seven projects.
3. In Supabase Auth, create the owner's account with sign-up disabled for the public.
4. Copy that account's user UUID from Authentication → Users and run `insert into public.site_admins (user_id) values ('<UUID>');` in SQL Editor.
5. Restart the dev server and open `/admin` to sign in and manage project content.

The app only exposes a publishable key. Do not put `SUPABASE_DB_URL`, a `service_role`, or any secret key in a `VITE_` variable.
