import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { projects, services } from '../data/portfolio'
import type { PortfolioProject } from '../data/portfolio'
import { supabase } from '../lib/supabase'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { copy, projectForLocale, servicesEn, type Locale } from '../lib/i18n'
import { defaultSiteSettings, localizedSettings, type SiteSettings } from '../lib/site-settings'
import { loadPublicSiteSettings } from '../lib/public-site-settings'

const siteUrl = import.meta.env.VITE_SITE_URL?.replace(/\/$/, '')
const homeTitle = 'Jhansen Wilson | Full-Stack Developer — Web, API & AI'
const homeDescription = 'Portofolio Jhansen Wilson, full-stack developer dengan pengalaman membangun aplikasi web, REST API, sistem perusahaan, dan integrasi AI.'

export const Route = createFileRoute('/')({
  loader: loadPublicSiteSettings,
  head: ({ loaderData }) => ({
    meta: [
      { title: homeTitle },
      { name: 'description', content: loaderData?.seo_description_id ?? homeDescription },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: homeTitle },
      { property: 'og:description', content: loaderData?.seo_description_id ?? homeDescription },
      { name: 'twitter:title', content: homeTitle },
      { name: 'twitter:description', content: loaderData?.seo_description_id ?? homeDescription },
    ],
    links: siteUrl ? [
      { rel: 'canonical', href: `${siteUrl}/` },
      { rel: 'alternate', hrefLang: 'id', href: `${siteUrl}/` },
      { rel: 'alternate', hrefLang: 'en', href: `${siteUrl}/en` },
    ] : [],
  }),
  component: HomeIndonesian,
})
const clamp = (value: number) => Math.min(1, Math.max(0, value))

function HomeIndonesian() {
  return <Home locale="id" initialSettings={Route.useLoaderData()} />
}

export function Home({ locale, initialSettings = defaultSiteSettings }: { locale: Locale; initialSettings?: SiteSettings }) {
  const t = copy[locale]
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(initialSettings)
  const local = localizedSettings(siteSettings, locale)
  const [projectItems, setProjectItems] = useState<PortfolioProject[]>(() => projects.map((project) => projectForLocale(project, locale)))
  const [contactBusy, setContactBusy] = useState(false)
  const [contactStatus, setContactStatus] = useState('')
  const heroRef = useRef<HTMLElement>(null)
  const marqueeRef = useRef<HTMLElement>(null)
  const storyRef = useRef<HTMLElement>(null)
  const aboutRef = useRef<HTMLElement>(null)
  const stackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true
    void fetch('/api/settings').then(async (response) => {
      if (!response.ok) return
      const settings = await response.json() as SiteSettings
      if (!active) return
      setSiteSettings(settings)
      const copy = localizedSettings(settings, locale)
      const title = locale === 'id'
        ? 'Jhansen Wilson | Full-Stack Developer — Web, API & AI'
        : 'Jhansen Wilson | Full-Stack Developer — Web, APIs & AI'
      document.title = title
      document.querySelector('meta[name="description"]')?.setAttribute('content', copy.seoDescription)
      document.querySelector('meta[property="og:description"]')?.setAttribute('content', copy.seoDescription)
      document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', copy.seoDescription)
    }).catch(() => undefined)
    return () => { active = false }
  }, [locale])

  useEffect(() => {
    setProjectItems(projects.map((project) => projectForLocale(project, locale)))
    if (!supabase) return
    void supabase.from('projects').select('slug,title,category,description,role,year,stack,image_url,image_alt,demo_url,repository_url,editorial,featured').eq('status', 'published').order('featured', { ascending: false }).order('sort_order').then(({ data, error }) => {
      if (!error && data) setProjectItems(data.map((project) => ({
        slug: project.slug,
        title: project.title,
        category: project.category as PortfolioProject['category'],
        description: project.description,
        role: project.role,
        year: project.year,
        stack: project.stack,
        image: project.image_url,
        imageAlt: project.image_alt,
        href: project.repository_url,
        demoUrl: project.demo_url,
        editorial: project.editorial,
        featured: project.featured,
        })).map((project) => projectForLocale(project, locale)))
    })
  }, [locale])

  const sendContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (contactBusy) return
    const form = event.currentTarget
    const values = new FormData(form)
    setContactBusy(true)
    setContactStatus('')
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.get('name'),
          email: values.get('email'),
          message: values.get('message'),
          website: values.get('website'),
        }),
      })
      if (!response.ok) throw new Error()
      form.reset()
      setContactStatus(t.sent)
    } catch {
      setContactStatus(t.sendError)
    } finally {
      setContactBusy(false)
    }
  }

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const hero = heroRef.current
    const marquee = marqueeRef.current
    const story = storyRef.current
    const about = aboutRef.current
    const stack = stackRef.current
    if (!hero || !marquee || !story || !about || !stack) return
    const cards = [...stack.querySelectorAll<HTMLElement>('.project-card')]
    let frame = 0
    const update = () => {
      frame = 0
      const heroRect = hero.getBoundingClientRect()
      const heroProgress = clamp(-heroRect.top / Math.max(1, heroRect.height - window.innerHeight))
      hero.style.setProperty('--hero-progress', String(heroProgress))
      const marqueeOffset = (window.innerHeight - marquee.getBoundingClientRect().top) * .28
      marquee.style.setProperty('--row-one', `${-1050 + marqueeOffset}px`)
      marquee.style.setProperty('--row-two', `${-500 - marqueeOffset}px`)
      const storyRect = story.getBoundingClientRect()
      const storyProgress = clamp(-storyRect.top / (storyRect.height - window.innerHeight))
      story.style.setProperty('--story-progress', String(storyProgress))
      story.dataset.scene = String(Math.min(2, Math.floor(storyProgress * 3)))
      const aboutRect = about.getBoundingClientRect()
      about.style.setProperty('--reveal', `${clamp((window.innerHeight * .8 - aboutRect.top) / (aboutRect.height * .55)) * 100}%`)
      const stackTop = stack.getBoundingClientRect().top + window.scrollY
      cards.forEach((card, index) => {
        const passed = clamp((window.scrollY - stackTop - card.offsetTop + window.innerHeight * .5) / window.innerHeight)
        card.style.setProperty('--card-scale', String(1 - (cards.length - index - 1) * .025 * passed))
      })
    }
    const requestUpdate = () => { if (!frame) frame = window.requestAnimationFrame(update) }
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      const rect = hero.getBoundingClientRect()
      hero.style.setProperty('--magnet-x', `${(event.clientX - rect.width / 2) / 18}px`)
      hero.style.setProperty('--magnet-y', `${(event.clientY - rect.height / 2) / 25}px`)
    }
    const reset = () => {
      hero.style.setProperty('--magnet-x', '0px')
      hero.style.setProperty('--magnet-y', '0px')
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).dataset.visible = 'true'
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: .12 })
    document.querySelectorAll<HTMLElement>('.fade-in').forEach((item) => observer.observe(item))
    document.documentElement.dataset.motion = 'true'
    update()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)
    hero.addEventListener('pointermove', move)
    hero.addEventListener('pointerleave', reset)
    return () => {
      observer.disconnect()
      delete document.documentElement.dataset.motion
      window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      hero.removeEventListener('pointermove', move)
      hero.removeEventListener('pointerleave', reset)
    }
  }, [])

  return <>
    <a className="skip-link" href="#konten">Lewati ke konten</a>
    <main id="konten">
      <section className="hero" id="atas" ref={heroRef} aria-labelledby="hero-title">
        <div className="hero-stage">
        <nav className="hero-nav fade-in" aria-label="Navigasi utama">
          <a className="hero-brand" href="#atas" aria-label="Jhansen Wilson, kembali ke awal">JW<span>.</span></a>
          <div className="hero-nav-links"><a href="#tentang">{t.navAbout}</a><a href="#skill">{t.navSkills}</a><a href="#karya">{t.navProjects}</a></div>
          <div className="hero-nav-actions"><LanguageSwitcher locale={locale} href={locale === 'id' ? '/en' : '/'} /><a className="hero-nav-cta" href="#kontak">{t.navContact} ↗</a></div>
        </nav>
        <div className="hero-layout">
          <div className="hero-copy fade-in"><p className="hero-eyebrow">JHANSEN WILSON <span>/ {local.role.toUpperCase()}</span></p><h1 id="hero-title">{local.heroTitle.split('\n').map((line, index) => <span className="hero-title-line" key={`${index}-${line}`}>{line}</span>)}</h1><p className="hero-description">{local.heroDescription}</p><div className="hero-actions"><a className="contact-button" href="#karya">{t.projectsCta} ↗</a><a className="hero-secondary" href="#tentang">{t.aboutCta} →</a></div></div>
          <div className="hero-visual" aria-hidden="true"><span className="hero-visual__grid" /><span className="hero-visual__orbit" /><img className="hero-portrait" src="/assets/jhansen-hero-3d.png" alt="" fetchPriority="high" /><span className="hero-visual__tag">01 / SOFTWARE ENGINEERING</span></div>
        </div>
        <div className="hero-bottom"><span>REACT · NODE.JS · POSTGRESQL · AI</span><a href="#perjalanan">{t.explore} ↓</a></div>
        </div>
      </section>

      <section className="marquee" ref={marqueeRef} aria-label={locale === 'id' ? 'Cuplikan visual proyek' : 'Project visual highlights'}>
        {[0, 1].map((row) => <div className={`marquee-row marquee-row--${row + 1}`} key={row} aria-hidden="true">
          {[...projectItems.slice(row ? 3 : 0, row ? 7 : 4), ...projectItems.slice(row ? 3 : 0, row ? 7 : 4), ...projectItems.slice(row ? 3 : 0, row ? 7 : 4)].map((project, index) => <img src={project.image} alt="" loading="lazy" decoding="async" key={index} />)}
        </div>)}
      </section>

      <section className="story" id="perjalanan" ref={storyRef} aria-labelledby="story-title" data-scene="0">
        <div className="story-stage">
          <div className="story-top"><span>01 — 03 / {t.processLabel}</span><span>{t.exploreScroll} ↓</span></div>
          <h2 id="story-title">{t.processTitle}</h2>
          <div className="story-panel story-panel--0">
            <div className="story-copy"><span className="story-number">01 / {t.process[0].kicker}</span><h3>{t.process[0].title}</h3><p>{t.process[0].description}</p><span className="story-keywords">{t.process[0].keywords}</span></div>
            <div className="story-screen"><div className="story-screen__bar"><span /><span /><span /><small>01 / ANALISIS</small></div><img src="/assets/projects/aksara.jpg" alt="Tampilan proyek Aksara Cakra" loading="lazy" /></div>
          </div>
          <div className="story-panel story-panel--1">
            <div className="story-copy"><span className="story-number">02 / {t.process[1].kicker}</span><h3>{t.process[1].title}</h3><p>{t.process[1].description}</p><span className="story-keywords">{t.process[1].keywords}</span></div>
            <div className="story-screen"><div className="story-screen__bar"><span /><span /><span /><small>02 / PENGEMBANGAN</small></div><img src="/assets/projects/acs.jpg" alt="Tampilan proyek ACS" loading="lazy" /></div>
          </div>
          <div className="story-panel story-panel--2">
            <div className="story-copy"><span className="story-number">03 / {t.process[2].kicker}</span><h3>{t.process[2].title}</h3><p>{t.process[2].description}</p><span className="story-keywords">{t.process[2].keywords}</span></div>
            <div className="story-screen"><div className="story-screen__bar"><span /><span /><span /><small>03 / PELUNCURAN</small></div><img src="/assets/projects/monitoring-expenses.jpg" alt="Tampilan proyek Monitoring Expenses" loading="lazy" /></div>
          </div>
          <div className="story-progress" aria-hidden="true"><span /></div>
        </div>
      </section>

      <section className="about" id="tentang" ref={aboutRef} aria-labelledby="about-title">
        <span className="about-deco about-deco--one" aria-hidden="true" /><span className="about-deco about-deco--two" aria-hidden="true" />
        <div className="about-inner"><h2 className="gradient-heading fade-in" id="about-title">{t.about}</h2><p className="about-intro">{local.about}</p><a className="contact-button fade-in" href="/resume">{t.resume} ↗</a></div>
      </section>

      <section className="services" id="skill" aria-labelledby="services-title">
        <div className="section-shell"><h2 className="fade-in" id="services-title">{t.skills}</h2><div className="service-list">
          {(locale === 'id' ? services : servicesEn).map((service, index) => <article className="service-item fade-in" key={service.title}><span className="service-number">{String(index + 1).padStart(2, '0')}</span><div><h3>{service.title}</h3><p>{service.description}</p></div></article>)}
        </div></div>
      </section>

      <section className="work" id="karya" aria-labelledby="work-title">
        <div className="section-shell"><p className="section-kicker">{t.projectKicker}</p><h2 className="gradient-heading fade-in" id="work-title">{t.projects}</h2><p className="work-note">{t.projectNote}</p></div>
        <div className="project-stack" ref={stackRef}>
          {projectItems.map((project, index) => <article className="project-card" style={{ top: `calc(80px + ${index * 16}px)` }} key={project.slug}>
            <div className="project-card__top"><span className="project-card__number">{String(index + 1).padStart(2, '0')}</span><div><span className="project-card__category">{project.featured ? (locale === 'id' ? 'UNGGULAN / ' : 'FEATURED / ') : ''}{project.category === 'Professional' ? (locale === 'id' ? 'Profesional' : 'Professional') : 'Personal'} / {project.editorial ? t.editorial : t.projectImage}</span><h3>{project.title}</h3><p>{project.description}</p></div><div className="project-card__actions"><a className="outline-button" href={`${locale === 'en' ? '/en' : ''}/projects/${project.slug}`}>{t.details} ↗</a><a className="outline-button" href={project.href} target="_blank" rel="noreferrer">{t.repository} ↗</a></div></div>
            <div className="project-card__gallery"><div className="project-card__small"><img src={project.image} alt="" loading="lazy" decoding="async" /><div className="project-card__stack">{project.stack.map((tool) => <span key={tool}>{tool}</span>)}</div></div><img className="project-card__main" src={project.image} alt={project.imageAlt || (project.editorial ? `${t.editorial} ${locale === 'id' ? 'untuk' : 'for'} ${project.title}` : `${t.projectImage} ${project.title}`)} loading="lazy" decoding="async" /></div>
          </article>)}
        </div>
      </section>

      <section className="contact" id="kontak" aria-labelledby="contact-title"><div className="section-shell"><p className="section-kicker">{t.contact}</p><h2 className="gradient-heading" id="contact-title">{t.contactTitle}</h2><a className="contact-button" href={`mailto:${siteSettings.contact_email}`}>{t.email} ↗</a><form className="contact-form" onSubmit={sendContact}>
        <h3>{t.formTitle}</h3>
        <div className="contact-honeypot" aria-hidden="true"><label>Website<input tabIndex={-1} name="website" autoComplete="off" /></label></div>
        <label>{t.nameLabel}<input name="name" autoComplete="name" maxLength={100} required /></label>
        <label>{t.emailLabel}<input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
        <label>{t.messageLabel}<textarea name="message" rows={5} maxLength={4000} required /></label>
        <p className="contact-privacy">{t.privacyNote}</p>
        <button className="contact-button" type="submit" disabled={contactBusy}>{contactBusy ? t.sending : t.sendMessage}</button>
        <p className="contact-status" role="status" aria-live="polite">{contactStatus}</p>
      </form><div className="contact-links"><a href={siteSettings.github_url} target="_blank" rel="noreferrer">GITHUB ↗</a><a href={siteSettings.linkedin_url} target="_blank" rel="noreferrer">LINKEDIN ↗</a></div></div></section>
    </main>
    <footer className="footer section-shell"><span>© 2026 JHANSEN WILSON</span><a href="#atas">{t.backTop} ↑</a></footer>
  </>
}
