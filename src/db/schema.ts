import { sql } from 'drizzle-orm'
import { anonRole, authUsers, authenticatedRole } from 'drizzle-orm/supabase'
import { boolean, check, integer, pgPolicy, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const siteAdmins = pgTable('site_admins', {
  userId: uuid('user_id').primaryKey().references(() => authUsers.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  pgPolicy('Admins can read their own membership', {
    for: 'select',
    to: authenticatedRole,
    using: sql`user_id = (select auth.uid())`,
  }),
])

export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  stack: text('stack').array().notNull().default(sql`'{}'::text[]`),
  imageUrl: text('image_url').notNull(),
  repositoryUrl: text('repository_url').notNull(),
  editorial: boolean('editorial').notNull().default(false),
  status: text('status').notNull().default('draft'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  check('projects_slug_format', sql`slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
  check('projects_category_valid', sql`category in ('Professional', 'Personal')`),
  check('projects_status_valid', sql`status in ('draft', 'published')`),
  check('projects_image_url_valid', sql`image_url ~ '^(https://|/assets/)'`),
  check('projects_repository_url_valid', sql`repository_url ~ '^https://'`),
  pgPolicy('Published projects are public; admins can read drafts', {
    for: 'select',
    to: [anonRole, authenticatedRole],
    using: sql`status = 'published' or (select public.is_site_admin())`,
  }),
  pgPolicy('Admins can create projects', {
    for: 'insert',
    to: authenticatedRole,
    withCheck: sql`(select public.is_site_admin())`,
  }),
  pgPolicy('Admins can update projects', {
    for: 'update',
    to: authenticatedRole,
    using: sql`(select public.is_site_admin())`,
    withCheck: sql`(select public.is_site_admin())`,
  }),
  pgPolicy('Admins can delete projects', {
    for: 'delete',
    to: authenticatedRole,
    using: sql`(select public.is_site_admin())`,
  }),
])
