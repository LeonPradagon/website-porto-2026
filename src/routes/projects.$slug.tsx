import { createFileRoute, notFound } from '@tanstack/react-router'
import { projects } from '../data/portfolio'
import type { PortfolioProject } from '../data/portfolio'
import { supabase } from '../lib/supabase'

const siteUrl = import.meta.env.VITE_SITE_URL?.replace(/\/$/, '')

export const Route = createFileRoute('/projects/$slug')({
  loader: async ({ params }) => {
    const fallback = projects.find(({ slug }) => slug === params.slug)
    if (supabase) {
      const { data, error } = await supabase.from('projects').select('slug,title,category,description,stack,image_url,repository_url,editorial').eq('slug', params.slug).eq('status', 'published').maybeSingle()
      if (!error) {
        if (!data) throw notFound()
        return {
          slug: data.slug,
          title: data.title,
          category: data.category as PortfolioProject['category'],
          description: data.description,
          stack: data.stack as string[],
          image: data.image_url,
          href: data.repository_url,
          editorial: data.editorial,
        }
      }
    }
    const project = fallback
    if (!project) throw notFound()
    return project
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [] }
    return { meta: [
      { title: `${loaderData.title} — Jhansen Wilson` },
      { name: 'description', content: loaderData.description },
      { property: 'og:type', content: 'article' },
      { property: 'og:title', content: `${loaderData.title} — Jhansen Wilson` },
      { property: 'og:description', content: loaderData.description },
      ...(siteUrl ? [{ property: 'og:image', content: `${siteUrl}${loaderData.image}` }] : []),
    ] }
  },
  component: ProjectDetail,
})

function ProjectDetail() {
  const project = Route.useLoaderData()

  return (
    <main className="project-detail">
      <nav className="project-detail__nav" aria-label="Breadcrumb">
        <a href="/#atas">JW<span>.</span></a>
        <span>/</span>
        <a href="/#karya">PROJECTS</a>
        <span>/</span>
        <span>{project.title}</span>
      </nav>
      <header className="project-detail__header">
        <p className="section-kicker">{project.category} / PROJECT</p>
        <h1>{project.title}</h1>
        <p>{project.description}</p>
        {project.editorial && <p className="project-detail__notice">Visual editorial — tangkapan layar produk belum tersedia.</p>}
      </header>
      <figure className="project-detail__media">
        <img src={project.image} alt={project.editorial ? `Visual editorial untuk ${project.title}` : `Tampilan ${project.title}`} />
      </figure>
      <section className="project-detail__meta" aria-labelledby="stack-title">
        <div><h2 id="stack-title">TECH STACK</h2><ul>{project.stack.map((item) => <li key={item}>{item}</li>)}</ul></div>
        <a className="contact-button" href={project.href} target="_blank" rel="noreferrer">VIEW SOURCE CODE ↗</a>
      </section>
      <a className="project-detail__back" href="/#karya">← BACK TO ALL PROJECTS</a>
    </main>
  )
}
