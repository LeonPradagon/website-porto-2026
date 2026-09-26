# Supabase setup

1. Copy `.env.example` to `.env.local`. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for the browser. Set `SUPABASE_DB_URL` to the Session Pooler URL (port 5432) for Drizzle migrations, and `SUPABASE_DB_RUNTIME_URL` to the Transaction Pooler URL (port 6543) for Netlify Functions. Keep both database URLs server-only.
2. Run `npm run db:migrate`. Drizzle applies the tracked migrations in order; they create the project table, admin membership table, RLS rules, and seed the current seven projects.
3. In Supabase Auth, create the owner's account with sign-up disabled for the public.
4. Copy that account's user UUID from Authentication → Users and run `insert into public.site_admins (user_id) values ('<UUID>');` in SQL Editor.
5. Restart the dev server and open `/admin` to sign in and manage project content.

The app only exposes a publishable key. Do not put either database URL, a `service_role`, or any secret key in a `VITE_` variable. Set both database URLs in Netlify's server environment for each deploy context.
