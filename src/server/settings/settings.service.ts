import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { defaultSiteSettings, type SiteSettings } from '../../lib/site-settings'
import { DatabaseService } from '../database.service'

const columns = `role_id, role_en, hero_title_id, hero_title_en, hero_description_id, hero_description_en, about_id, about_en, seo_description_id, seo_description_en, contact_email, github_url, linkedin_url`

@Injectable()
export class SettingsService {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  async getPublicSettings(): Promise<SiteSettings> {
    const [settings] = await this.database.sql.unsafe(`select ${columns} from public.site_settings where id=1`)
    return (settings ?? defaultSiteSettings) as unknown as SiteSettings
  }

  async update(value: unknown): Promise<SiteSettings> {
    const input = validateSettings(value)
    const [settings] = await this.database.sql`
      update public.site_settings set
        role_id=${input.role_id}, role_en=${input.role_en},
        hero_title_id=${input.hero_title_id}, hero_title_en=${input.hero_title_en},
        hero_description_id=${input.hero_description_id}, hero_description_en=${input.hero_description_en},
        about_id=${input.about_id}, about_en=${input.about_en},
        seo_description_id=${input.seo_description_id}, seo_description_en=${input.seo_description_en},
        contact_email=${input.contact_email}, github_url=${input.github_url}, linkedin_url=${input.linkedin_url},
        updated_at=now()
      where id=1 returning ${this.database.sql.unsafe(columns)}
    `
    if (!settings) throw new NotFoundException('Site settings are not initialized')
    return settings as SiteSettings
  }
}

function validateSettings(value: unknown): SiteSettings {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new BadRequestException('Settings body must be an object')
  const body = value as Record<string, unknown>
  const field = (name: keyof SiteSettings, min: number, max: number) => {
    const candidate = body[name]
    if (typeof candidate !== 'string' || candidate.trim().length < min || candidate.trim().length > max) {
      throw new BadRequestException(`${name} must contain ${min} to ${max} characters`)
    }
    return candidate.trim()
  }
  const input: SiteSettings = {
    role_id: field('role_id', 2, 80), role_en: field('role_en', 2, 80),
    hero_title_id: field('hero_title_id', 5, 180), hero_title_en: field('hero_title_en', 5, 180),
    hero_description_id: field('hero_description_id', 20, 400), hero_description_en: field('hero_description_en', 20, 400),
    about_id: field('about_id', 20, 2000), about_en: field('about_en', 20, 2000),
    seo_description_id: field('seo_description_id', 40, 300), seo_description_en: field('seo_description_en', 40, 300),
    contact_email: field('contact_email', 5, 254),
    github_url: field('github_url', 12, 300), linkedin_url: field('linkedin_url', 12, 300),
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.contact_email)) throw new BadRequestException('contact_email is invalid')
  if (!isHttpsHost(input.github_url, ['github.com', 'www.github.com'])) throw new BadRequestException('github_url must be a GitHub HTTPS URL')
  if (!isHttpsHost(input.linkedin_url, ['linkedin.com', 'www.linkedin.com'])) throw new BadRequestException('linkedin_url must be a LinkedIn HTTPS URL')
  return input
}

function isHttpsHost(value: string, hosts: string[]) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && hosts.includes(url.hostname)
  } catch {
    return false
  }
}
