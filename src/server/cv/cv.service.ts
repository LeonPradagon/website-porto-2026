import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import type { CvProfile, CvSection } from '../../lib/cv'
import { DatabaseService } from '../database.service'

const sections = new Set<CvSection>(['experience', 'education', 'project', 'skill', 'certification'])

@Injectable()
export class CvService {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  async getDraft() {
    const [row] = await this.database.sql`select draft_data, published_at from public.cv_profiles where id=1`
    if (!row) throw new NotFoundException('CV builder is not initialized')
    return { draft: row.draft_data, published_at: row.published_at }
  }

  async getPublished(): Promise<CvProfile> {
    const [row] = await this.database.sql`select published_data from public.cv_profiles where id=1 and published_data is not null`
    if (!row) throw new NotFoundException('No public CV has been published')
    return row.published_data as CvProfile
  }

  async updateDraft(value: unknown) {
    const draft = validateCvProfile(value)
    const [row] = await this.database.sql`
      update public.cv_profiles set draft_data=${JSON.stringify(draft)}::jsonb, updated_at=now()
      where id=1 returning draft_data, published_at
    `
    if (!row) throw new NotFoundException('CV builder is not initialized')
    return { draft: row.draft_data, published_at: row.published_at }
  }

  async publish() {
    const [current] = await this.database.sql`select draft_data from public.cv_profiles where id=1`
    if (!current) throw new NotFoundException('CV builder is not initialized')
    const draft = validateCvProfile(current.draft_data)
    if (!draft.name || !draft.headline || !draft.summary.trim()) {
      throw new BadRequestException('Name, headline, and summary are required before publishing')
    }
    const visibleEntries = draft.entries.filter((entry) => entry.visible)
    if (!visibleEntries.length) {
      throw new BadRequestException('At least one visible CV entry is required before publishing')
    }
    for (const entry of visibleEntries) {
      if (!entry.title) throw new BadRequestException('Every visible CV entry needs a title')
      if (entry.section === 'experience' && (!entry.organization || (!entry.start_date && !entry.end_date) || !entry.details.length)) {
        throw new BadRequestException(`Experience “${entry.title}” needs organization, date range, and at least one achievement`)
      }
    }
    const [row] = await this.database.sql`
      update public.cv_profiles set published_data=draft_data, published_at=now(), updated_at=now()
      where id=1 returning published_data, published_at
    `
    return { published: row.published_data, published_at: row.published_at }
  }
}

export function validateCvProfile(value: unknown): CvProfile {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new BadRequestException('CV profile must be an object')
  const body = value as Record<string, unknown>
  const text = (key: string, max: number, required = false) => {
    const item = body[key]
    if (typeof item !== 'string' || item.length > max || (required && !item.trim())) {
      throw new BadRequestException(`${key} must be ${required ? 'required and ' : ''}at most ${max} characters`)
    }
    return item.trim()
  }
  const entries = body.entries
  if (!Array.isArray(entries) || entries.length > 200) throw new BadRequestException('entries must contain at most 200 items')
  const ids = new Set<string>()
  for (const entry of entries) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry) || typeof (entry as Record<string, unknown>).id !== 'string') continue
    const id = (entry as Record<string, unknown>).id as string
    if (ids.has(id)) throw new BadRequestException(`Duplicate CV entry id: ${id}`)
    ids.add(id)
  }
  const profile: CvProfile = {
    name: text('name', 120, true),
    headline: text('headline', 160, true),
    email: text('email', 254),
    phone: text('phone', 50),
    location: text('location', 120),
    linkedin_url: text('linkedin_url', 500),
    github_url: text('github_url', 500),
    summary: text('summary', 3000),
    entries: entries.map((item, index) => validateEntry(item, index)),
  }
  if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) throw new BadRequestException('email is invalid')
  for (const key of ['linkedin_url', 'github_url'] as const) {
    if (profile[key] && !isHttpsUrl(profile[key])) throw new BadRequestException(`${key} must use HTTPS`)
  }
  return profile
}

function validateEntry(value: unknown, index: number): CvProfile['entries'][number] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new BadRequestException(`entries[${index}] must be an object`)
  const item = value as Record<string, unknown>
  const field = (key: string, max: number) => {
    const value = item[key]
    if (typeof value !== 'string' || value.length > max) throw new BadRequestException(`entries[${index}].${key} is invalid`)
    return value.trim()
  }
  const id = field('id', 80)
  const section = item.section
  const order = item.sort_order
  const details = item.details
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) throw new BadRequestException(`entries[${index}].id is invalid`)
  if (typeof section !== 'string' || !sections.has(section as CvSection)) throw new BadRequestException(`entries[${index}].section is invalid`)
  if (!Number.isSafeInteger(order) || (order as number) < 0) throw new BadRequestException(`entries[${index}].sort_order is invalid`)
  if (!Array.isArray(details) || details.length > 30 || details.some((value) => typeof value !== 'string' || value.length > 1500)) {
    throw new BadRequestException(`entries[${index}].details must contain at most 30 short strings`)
  }
  if (typeof item.visible !== 'boolean') throw new BadRequestException(`entries[${index}].visible must be boolean`)
  const url = field('url', 500)
  if (url && !isHttpsUrl(url)) throw new BadRequestException(`entries[${index}].url must use HTTPS`)
  return {
    id,
    section: section as CvSection,
    title: field('title', 200),
    organization: field('organization', 200),
    location: field('location', 120),
    start_date: field('start_date', 50),
    end_date: field('end_date', 50),
    details: details.map((value) => (value as string).trim()).filter(Boolean),
    url,
    sort_order: order as number,
    visible: item.visible,
  }
}

function isHttpsUrl(value: string) {
  try { return new URL(value).protocol === 'https:' } catch { return false }
}
