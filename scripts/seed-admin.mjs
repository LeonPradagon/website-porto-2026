import { createClient } from '@supabase/supabase-js'
import postgres from 'postgres'
import { createInterface } from 'node:readline/promises'
import { stdin, stdout } from 'node:process'

const email = process.argv[2]?.trim().toLowerCase()
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY
const databaseUrl = process.env.SUPABASE_DB_URL

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Usage: npm run admin:seed -- owner@example.com')
  process.exit(1)
}
if (!supabaseUrl || !supabaseKey || !databaseUrl) {
  console.error('Set VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY), and SUPABASE_DB_URL in .env.local.')
  process.exit(1)
}

const readline = createInterface({ input: stdin, output: stdout })
const answer = await readline.question(`Invite ${email} and grant CMS owner access? Type the email to confirm: `)
readline.close()
if (answer.trim().toLowerCase() !== email) {
  console.error('Confirmation did not match. No changes made.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})
const sql = postgres(databaseUrl, { max: 1, connect_timeout: 10, prepare: false, ssl: 'require' })

try {
  const [existing] = await sql`
    select id, email_confirmed_at from auth.users where lower(email) = ${email} limit 1
  `
  let userId = existing?.id
  let emailConfirmed = Boolean(existing?.email_confirmed_at)
  if (!userId) {
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email)
    if (error) throw error
    userId = data.user?.id
    emailConfirmed = Boolean(data.user?.email_confirmed_at)
  }

  if (!userId) throw new Error('Supabase Auth returned no user for the invitation.')
  await sql`insert into public.site_admins (user_id, role) values (${userId}::uuid, 'owner') on conflict (user_id) do update set role = 'owner'`
  console.log(`Owner access granted to ${email}.`)
  console.log(emailConfirmed
    ? 'Account already exists. If you do not know its password, send a password-reset email from Supabase Auth.'
    : 'Supabase sent an invitation email. Accept it to set a password, then sign in at /admin.')
} catch (error) {
  console.error(`Admin bootstrap failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  process.exitCode = 1
} finally {
  await sql.end()
}
