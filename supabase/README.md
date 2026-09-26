# Supabase setup

1. Copy `.env.example` to `.env.local`. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for the browser, and `VITE_SITE_URL` to the site's HTTPS origin. Set `SUPABASE_DB_URL` to the Session Pooler URL (port 5432) for Drizzle migrations, and `SUPABASE_DB_RUNTIME_URL` to the Transaction Pooler URL (port 6543) for Netlify Functions. Keep both database URLs server-only.
2. Run `npm run db:migrate`. Drizzle applies the tracked migrations in order; they create the project table, admin membership table, RLS rules, and seed the current seven projects.
3. For the first CMS owner, add a Supabase server-side secret key as `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. Never use a `VITE_` prefix or commit this key.
4. Run `npm run admin:seed -- owner@example.com` and confirm the exact email at the prompt. The script invites the first owner and grants the `owner` role; no password is generated or stored. Accept the invitation to set a password.
5. Open `/admin` and sign in. The owner can invite CMS admins and review account activity from the User Management and Audit Trail menus.

In Supabase Dashboard → Authentication → URL Configuration, add `https://your-domain.com/admin` to the Redirect URLs allowlist. Add `http://localhost:5173/admin` for local development if using the default Vite port. Admins can change their own password in My Account; Owners can send password-reset emails from User Management. A reset link returns to `/admin` to set the new password.

The app only exposes a publishable key. Do not put either database URL, a `service_role`, or any secret key in a `VITE_` variable. Set both database URLs and `SUPABASE_SERVICE_ROLE_KEY` in Netlify's server environment for each deploy context; the key is only used to invite new users. It is never sent to browsers.

Migration `0010` is additive and keeps existing admin memberships. It assigns `owner` to the oldest existing admin only when no owner exists. If rolling application code back, the added schema can remain in place; do not drop the audit table or role column without first preserving audit records and restoring an owner membership.
