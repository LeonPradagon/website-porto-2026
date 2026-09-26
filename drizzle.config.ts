import { existsSync } from 'node:fs'
import { defineConfig } from 'drizzle-kit'

if (existsSync('.env.local')) process.loadEnvFile('.env.local')

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: process.env.SUPABASE_DB_URL ? { url: process.env.SUPABASE_DB_URL } : undefined,
  entities: { roles: { provider: 'supabase' } },
})
