import { Controller, Get, Header, Inject, ServiceUnavailableException } from '@nestjs/common'
import { DatabaseService } from '../database.service'

@Controller()
export class SeoController {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml; charset=utf-8')
  async sitemap() {
    const siteUrl = this.getSiteUrl()
    let projects: Array<{ slug: string }>
    try {
      projects = await this.database.sql`select slug from public.projects where status='published' order by sort_order, slug`
    } catch {
      throw new ServiceUnavailableException('Sitemap is temporarily unavailable')
    }

    const routes = [
      { id: '/', en: '/en' },
      ...projects.map(({ slug }) => ({ id: `/projects/${encodeURIComponent(slug)}`, en: `/en/projects/${encodeURIComponent(slug)}` })),
    ]
    const entries = routes.map(({ id, en }) => {
      const idUrl = xmlEscape(`${siteUrl}${id}`)
      const enUrl = xmlEscape(`${siteUrl}${en}`)
      return `<url><loc>${idUrl}</loc><xhtml:link rel="alternate" hreflang="id" href="${idUrl}"/><xhtml:link rel="alternate" hreflang="en" href="${enUrl}"/></url><url><loc>${enUrl}</loc><xhtml:link rel="alternate" hreflang="id" href="${idUrl}"/><xhtml:link rel="alternate" hreflang="en" href="${enUrl}"/></url>`
    }).join('')

    return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries}</urlset>`
  }

  @Get('robots.txt')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  robots() {
    return `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${this.getSiteUrl()}/sitemap.xml\n`
  }

  private getSiteUrl() {
    const value = process.env.VITE_SITE_URL
    if (!value) throw new ServiceUnavailableException('Site URL is not configured')
    try {
      const url = new URL(value)
      if (url.protocol !== 'https:') throw new Error('HTTPS required')
      return url.origin
    } catch {
      throw new ServiceUnavailableException('Site URL is invalid')
    }
  }
}

function xmlEscape(value: string) {
  return value.replace(/[<>&"']/g, (character) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[character]!)
}
