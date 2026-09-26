import { createFileRoute } from '@tanstack/react-router'
import { Home } from './index'
import { loadPublicSiteSettings } from '../lib/public-site-settings'

const siteUrl = import.meta.env.VITE_SITE_URL?.replace(/\/$/, '')
const title = 'Jhansen Wilson | Full-Stack Developer — Web, APIs & AI'
const description = 'Portfolio of Jhansen Wilson, a full-stack developer building web applications, REST APIs, business systems, and AI integrations.'

export const Route = createFileRoute('/en/')({
  loader: loadPublicSiteSettings,
  head: ({ loaderData }) => ({
    meta: [
      { title },
      { name: 'description', content: loaderData?.seo_description_en ?? description },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'en_US' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: loaderData?.seo_description_en ?? description },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: loaderData?.seo_description_en ?? description },
    ],
    links: [
      ...(siteUrl ? [
        { rel: 'canonical', href: `${siteUrl}/en` },
        { rel: 'alternate', hrefLang: 'id', href: `${siteUrl}/` },
        { rel: 'alternate', hrefLang: 'en', href: `${siteUrl}/en` },
      ] : []),
    ],
  }),
  component: EnglishHome,
})

function EnglishHome() {
  return <Home locale="en" initialSettings={Route.useLoaderData()} />
}
