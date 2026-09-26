import type { PortfolioProject } from '../data/portfolio'
import { LanguageSwitcher } from './LanguageSwitcher'
import { copy, type Locale } from '../lib/i18n'

export function ProjectDetailPage({ project, locale }: { project: PortfolioProject; locale: Locale }) {
  const t = copy[locale]
  return (
    <main className="project-detail">
      <nav className="project-detail__nav" aria-label={locale === 'id' ? 'Breadcrumb' : 'Breadcrumb'}>
        <a href={locale === 'en' ? '/en' : '/'}>JW<span>.</span></a>
        <span>/</span>
        <a href={`${locale === 'en' ? '/en' : ''}/#karya`}>{t.projects}</a>
        <span>/</span>
        <span>{project.title}</span>
        <LanguageSwitcher locale={locale} href={`${locale === 'id' ? '/en' : ''}/projects/${project.slug}`} />
      </nav>
      <header className="project-detail__header">
        <p className="section-kicker">{project.category === 'Professional' ? (locale === 'id' ? 'PROYEK PROFESIONAL' : 'PROFESSIONAL PROJECT') : (locale === 'id' ? 'PROYEK PERSONAL' : 'PERSONAL PROJECT')}</p>
        <h1>{project.title}</h1>
        <p>{project.description}</p>
        {(project.role || project.year) && <p className="project-detail__context">{[project.role, project.year].filter(Boolean).join(' · ')}</p>}
        {project.editorial && <p className="project-detail__notice">{locale === 'id' ? 'Visual editorial — tangkapan layar produk belum tersedia.' : 'Editorial visual — original product screenshots are not available.'}</p>}
      </header>
      <figure className="project-detail__media">
        <img src={project.image} alt={project.imageAlt || (project.editorial ? `${t.editorial} ${locale === 'id' ? 'untuk' : 'for'} ${project.title}` : `${t.projectImage} ${project.title}`)} />
      </figure>
      <section className="project-detail__meta" aria-labelledby="stack-title">
        <div><h2 id="stack-title">{locale === 'id' ? 'TEKNOLOGI YANG DIGUNAKAN' : 'TECHNOLOGIES USED'}</h2><ul>{project.stack.map((item) => <li key={item}>{item}</li>)}</ul></div>
         <div className="project-detail__links">{project.demoUrl && <a className="contact-button" href={project.demoUrl} target="_blank" rel="noreferrer">{locale === 'id' ? 'LIHAT DEMO' : 'VIEW DEMO'} ↗</a>}<a className="contact-button" href={project.href} target="_blank" rel="noreferrer">{t.repository} ↗</a></div>
      </section>
      <a className="project-detail__back" href={`${locale === 'en' ? '/en' : ''}/#karya`}>← {locale === 'id' ? 'KEMBALI KE SEMUA PROYEK' : 'BACK TO ALL PROJECTS'}</a>
    </main>
  )
}
