# Supabase setup

1. Copy `.env.example` to `.env.local`. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for the browser. Set `SUPABASE_DB_URL` to the Session Pooler URL (port 5432) for Drizzle migrations, and `SUPABASE_DB_RUNTIME_URL` to the Transaction Pooler URL (port 6543) for Netlify Functions. Keep both database URLs server-only.
2. Run `npm run db:migrate`. Drizzle applies the tracked migrations in order; they create the project table, admin membership table, RLS rules, and seed the current seven projects.
3. For the first admin, add a Supabase server-side secret key as `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. Never use a `VITE_` prefix or commit this key.
4. Run `npm run admin:seed -- jhansen.wilson@gmail.com` and confirm the exact email at the prompt. The script invites the account and grants membership in `site_admins`; no password is generated or stored. Accept the email invitation to set a password.
5. Open `/admin` and sign in. For another admin, rerun the command with that person's email after confirming it.

The app only exposes a publishable key. Do not put either database URL, a `service_role`, or any secret key in a `VITE_` variable. Set both database URLs in Netlify's server environment for each deploy context. Remove `SUPABASE_SERVICE_ROLE_KEY` from local setup after bootstrapping; the app does not need it at runtime.
