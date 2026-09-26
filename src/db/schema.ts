import { sql } from 'drizzle-orm'
import { anonRole, authUsers, authenticatedRole } from 'drizzle-orm/supabase'
import { boolean, check, integer, jsonb, pgPolicy, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const contactMessages = pgTable('contact_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  readAt: timestamp('read_at', { withTimezone: true }),
}, (table) => [
  check('contact_messages_name_length', sql`char_length(name) between 1 and 100`),
  check('contact_messages_email_length', sql`char_length(email) between 3 and 254`),
  check('contact_messages_body_length', sql`char_length(message) between 1 and 4000`),
]).enableRLS()

export const contactRateLimits = pgTable('contact_rate_limits', {
  keyHash: text('key_hash').primaryKey(),
  windowStartedAt: timestamp('window_started_at', { withTimezone: true }).notNull().defaultNow(),
  requestCount: integer('request_count').notNull().default(0),
}).enableRLS()

export const siteSettings = pgTable('site_settings', {
  id: integer('id').primaryKey().default(1),
  roleId: text('role_id').notNull(),
  roleEn: text('role_en').notNull(),
  heroTitleId: text('hero_title_id').notNull(),
  heroTitleEn: text('hero_title_en').notNull(),
  heroDescriptionId: text('hero_description_id').notNull(),
  heroDescriptionEn: text('hero_description_en').notNull(),
  aboutId: text('about_id').notNull(),
  aboutEn: text('about_en').notNull(),
  seoDescriptionId: text('seo_description_id').notNull(),
  seoDescriptionEn: text('seo_description_en').notNull(),
  contactEmail: text('contact_email').notNull(),
  githubUrl: text('github_url').notNull(),
  linkedinUrl: text('linkedin_url').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  check('site_settings_singleton', sql`id = 1`),
  pgPolicy('Public can read site settings', {
    for: 'select',
    to: [anonRole, authenticatedRole],
    using: sql`true`,
  }),
]).enableRLS()

export const mediaAssets = pgTable('media_assets', {
  id: uuid('id').primaryKey().defaultRandom(),
  storagePath: text('storage_path').notNull().unique(),
  publicUrl: text('public_url').notNull().unique(),
  mediaType: text('media_type').notNull(),
  mimeType: text('mime_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  altText: text('alt_text').notNull(),
  createdBy: uuid('created_by').references(() => authUsers.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  check('media_assets_type_valid', sql`media_type in ('image', 'video')`),
  check('media_assets_mime_valid', sql`mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm')`),
  check('media_assets_size_valid', sql`size_bytes between 1 and 52428800`),
  check('media_assets_alt_length', sql`char_length(alt_text) between 1 and 500`),
  pgPolicy('Public can read media metadata', {
    for: 'select',
    to: [anonRole, authenticatedRole],
    using: sql`true`,
  }),
  pgPolicy('Admins can add media metadata', {
    for: 'insert',
    to: authenticatedRole,
    withCheck: sql`(select public.is_site_admin())`,
  }),
  pgPolicy('Admins can update media metadata', {
    for: 'update',
    to: authenticatedRole,
    using: sql`(select public.is_site_admin())`,
    withCheck: sql`(select public.is_site_admin())`,
  }),
  pgPolicy('Admins can delete media metadata', {
    for: 'delete',
    to: authenticatedRole,
    using: sql`(select public.is_site_admin())`,
  }),
]).enableRLS()

export const cvProfiles = pgTable('cv_profiles', {
  id: integer('id').primaryKey().default(1),
  draftData: jsonb('draft_data').notNull(),
  publishedData: jsonb('published_data'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
}, (table) => [
  check('cv_profiles_singleton', sql`id = 1`),
]).enableRLS()

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
  role: text('role').notNull().default(''),
  year: integer('year'),
  stack: text('stack').array().notNull().default(sql`'{}'::text[]`),
  imageUrl: text('image_url').notNull(),
  imageAlt: text('image_alt').notNull().default(''),
  demoUrl: text('demo_url'),
  repositoryUrl: text('repository_url').notNull(),
  editorial: boolean('editorial').notNull().default(false),
  featured: boolean('featured').notNull().default(false),
  status: text('status').notNull().default('draft'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  check('projects_slug_format', sql`slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
  check('projects_category_valid', sql`category in ('Professional', 'Personal')`),
  check('projects_status_valid', sql`status in ('draft', 'published')`),
  check('projects_image_url_valid', sql`image_url ~ '^(https://|/assets/)'`),
  check('projects_image_alt_length', sql`char_length(image_alt) <= 500`),
  check('projects_role_length', sql`char_length(role) <= 200`),
  check('projects_year_valid', sql`year is null or year between 1990 and 2100`),
  check('projects_demo_url_valid', sql`demo_url is null or demo_url ~ '^https://'`),
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
