import { createFileRoute } from '@tanstack/react-router'
import { ProjectDetailPage } from '../components/ProjectDetailPage'
import { loadPublicProject } from '../lib/public-projects'
import { projectForLocale } from '../lib/i18n'

const siteUrl = import.meta.env.VITE_SITE_URL?.replace(/\/$/, '')

export const Route = createFileRoute('/projects/$slug')({
  loader: async ({ params }) => projectForLocale(await loadPublicProject(params.slug), 'id'),
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] }
    const title = `${loaderData.title} — Proyek Full-Stack Jhansen Wilson`
    const image = loaderData.image.startsWith('https://') ? loaderData.image : siteUrl ? `${siteUrl}${loaderData.image}` : undefined
    const canonical = siteUrl ? `${siteUrl}/projects/${encodeURIComponent(loaderData.slug)}` : undefined
    return {
      meta: [
        { title },
        { name: 'description', content: loaderData.description },
        { property: 'og:type', content: 'article' },
        { property: 'og:site_name', content: 'Jhansen Wilson' },
        { property: 'og:locale', content: 'id_ID' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: loaderData.description },
        ...(image ? [{ property: 'og:image', content: image }, { property: 'og:image:alt', content: `Tampilan proyek ${loaderData.title}` }, { name: 'twitter:image', content: image }] : []),
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: loaderData.description },
      ],
      links: [
        ...(canonical ? [{ rel: 'canonical', href: canonical }] : []),
        ...(siteUrl ? [
          { rel: 'alternate', hrefLang: 'id', href: `${siteUrl}/projects/${encodeURIComponent(loaderData.slug)}` },
          { rel: 'alternate', hrefLang: 'en', href: `${siteUrl}/en/projects/${encodeURIComponent(loaderData.slug)}` },
        ] : []),
      ],
    }
  },
  component: ProjectDetail,
})

function ProjectDetail() {
  return <ProjectDetailPage project={Route.useLoaderData()} locale="id" />
}
