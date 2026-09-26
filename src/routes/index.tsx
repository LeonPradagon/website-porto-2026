import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { aboutText, projects, services } from '../data/portfolio'
import type { PortfolioProject } from '../data/portfolio'
import { supabase } from '../lib/supabase'

export const Route = createFileRoute('/')({ component: Home })
const clamp = (value: number) => Math.min(1, Math.max(0, value))

function Home() {
  const [projectItems, setProjectItems] = useState<PortfolioProject[]>(projects)
  const heroRef = useRef<HTMLElement>(null)
  const marqueeRef = useRef<HTMLElement>(null)
  const storyRef = useRef<HTMLElement>(null)
  const aboutRef = useRef<HTMLElement>(null)
  const stackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!supabase) return
    void supabase.from('projects').select('slug,title,category,description,stack,image_url,repository_url,editorial').eq('status', 'published').order('sort_order').then(({ data, error }) => {
      if (!error && data) setProjectItems(data.map((project) => ({
        slug: project.slug,
        title: project.title,
        category: project.category as PortfolioProject['category'],
        description: project.description,
        stack: project.stack,
        image: project.image_url,
        href: project.repository_url,
        editorial: project.editorial,
      })))
    })
  }, [])

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
          <div className="hero-nav-links"><a href="#tentang">ABOUT</a><a href="#skill">SKILLS</a><a href="#karya">PROJECTS</a></div>
          <a className="hero-nav-cta" href="#kontak">LET'S TALK ↗</a>
        </nav>
        <div className="hero-layout">
          <div className="hero-copy fade-in"><p className="hero-eyebrow">JHANSEN WILSON <span>/ FULL-STACK DEVELOPER</span></p><h1 id="hero-title">Build<br /><em>better</em><br />systems.</h1><p className="hero-description">Saya membangun aplikasi web, API, dan integrasi AI yang membantu orang bekerja lebih efektif.</p><div className="hero-actions"><a className="contact-button" href="#karya">EXPLORE PROJECTS ↗</a><a className="hero-secondary" href="#tentang">ABOUT ME →</a></div></div>
          <div className="hero-visual" aria-hidden="true"><span className="hero-visual__grid" /><span className="hero-visual__orbit" /><img className="hero-portrait" src="/assets/jhansen-hero-3d.png" alt="" fetchPriority="high" /><span className="hero-visual__tag">01 / SOFTWARE ENGINEERING</span></div>
        </div>
        <div className="hero-bottom"><span>REACT · NODE · POSTGRES · AI</span><a href="#perjalanan">SCROLL TO EXPLORE ↓</a></div>
        </div>
      </section>

      <section className="marquee" ref={marqueeRef} aria-label="Cuplikan visual proyek">
        {[0, 1].map((row) => <div className={`marquee-row marquee-row--${row + 1}`} key={row} aria-hidden="true">
          {[...projectItems.slice(row ? 3 : 0, row ? 7 : 4), ...projectItems.slice(row ? 3 : 0, row ? 7 : 4), ...projectItems.slice(row ? 3 : 0, row ? 7 : 4)].map((project, index) => <img src={project.image} alt="" loading="lazy" decoding="async" key={index} />)}
        </div>)}
      </section>

      <section className="story" id="perjalanan" ref={storyRef} aria-labelledby="story-title" data-scene="0">
        <div className="story-stage">
          <div className="story-top"><span>01 — 03 / THE PROCESS</span><span>SCROLL TO DISCOVER ↓</span></div>
          <h2 id="story-title">FROM IDEA <em>TO IMPACT.</em></h2>
          <div className="story-panel story-panel--0">
            <div className="story-copy"><span className="story-number">01 / THINK</span><h3>Understand<br />the problem.</h3><p>Mulai dari kebutuhan pengguna dan alur kerja. Solusi yang baik lahir dari masalah yang dipahami dengan jelas.</p><span className="story-keywords">RESEARCH / SYSTEM DESIGN / UX</span></div>
            <div className="story-screen"><div className="story-screen__bar"><span /><span /><span /><small>01 / DISCOVER</small></div><img src="/assets/projects/aksara.jpg" alt="Tampilan proyek Aksara Cakra" loading="lazy" /></div>
          </div>
          <div className="story-panel story-panel--1">
            <div className="story-copy"><span className="story-number">02 / BUILD</span><h3>Make it<br />work beautifully.</h3><p>Antarmuka, API, dan data dirangkai menjadi sistem yang cepat, jelas, dan siap dipakai.</p><span className="story-keywords">REACT / API / DATABASE</span></div>
            <div className="story-screen"><div className="story-screen__bar"><span /><span /><span /><small>02 / ENGINEER</small></div><img src="/assets/projects/acs.jpg" alt="Tampilan proyek ACS" loading="lazy" /></div>
          </div>
          <div className="story-panel story-panel--2">
            <div className="story-copy"><span className="story-number">03 / DELIVER</span><h3>Bring ideas<br />to life.</h3><p>Dari prototipe hingga produk yang bisa digunakan, setiap detail diarahkan pada dampak nyata.</p><span className="story-keywords">TEST / DEPLOY / ITERATE</span></div>
            <div className="story-screen"><div className="story-screen__bar"><span /><span /><span /><small>03 / LAUNCH</small></div><img src="/assets/projects/monitoring-expenses.jpg" alt="Tampilan proyek Monitoring Expenses" loading="lazy" /></div>
          </div>
          <div className="story-progress" aria-hidden="true"><span /></div>
        </div>
      </section>

      <section className="about" id="tentang" ref={aboutRef} aria-labelledby="about-title">
        <span className="about-deco about-deco--one" aria-hidden="true" /><span className="about-deco about-deco--two" aria-hidden="true" />
        <div className="about-inner"><h2 className="gradient-heading fade-in" id="about-title">ABOUT ME</h2><p className="about-intro">{aboutText}</p><a className="contact-button fade-in" href="/resume/jahnsen-cv.pdf" target="_blank" rel="noreferrer">VIEW RESUME ↗</a></div>
      </section>

      <section className="services" id="skill" aria-labelledby="services-title">
        <div className="section-shell"><h2 className="fade-in" id="services-title">WHAT I DO</h2><div className="service-list">
          {services.map((service, index) => <article className="service-item fade-in" key={service.title}><span className="service-number">{String(index + 1).padStart(2, '0')}</span><div><h3>{service.title}</h3><p>{service.description}</p></div></article>)}
        </div></div>
      </section>

      <section className="work" id="karya" aria-labelledby="work-title">
        <div className="section-shell"><p className="section-kicker">SELECTED WORK / 2026</p><h2 className="gradient-heading fade-in" id="work-title">PROJECTS</h2><p className="work-note">Karya profesional dan proyek personal. Visual editorial diberi label ketika tangkapan layar proyek belum tersedia.</p></div>
        <div className="project-stack" ref={stackRef}>
          {projectItems.map((project, index) => <article className="project-card" style={{ top: `calc(80px + ${index * 16}px)` }} key={project.slug}>
            <div className="project-card__top"><span className="project-card__number">{String(index + 1).padStart(2, '0')}</span><div><span className="project-card__category">{project.category} / {project.editorial ? 'Visual editorial' : 'Tampilan proyek asli'}</span><h3>{project.title}</h3><p>{project.description}</p></div><div className="project-card__actions"><a className="outline-button" href={`/projects/${project.slug}`}>DETAILS ↗</a><a className="outline-button" href={project.href} target="_blank" rel="noreferrer">VIEW CODE ↗</a></div></div>
            <div className="project-card__gallery"><div className="project-card__small"><img src={project.image} alt="" loading="lazy" decoding="async" /><div className="project-card__stack">{project.stack.map((tool) => <span key={tool}>{tool}</span>)}</div></div><img className="project-card__main" src={project.image} alt={project.editorial ? `Visual editorial untuk ${project.title}` : `Tampilan ${project.title}`} loading="lazy" decoding="async" /></div>
          </article>)}
        </div>
      </section>

      <section className="contact" id="kontak" aria-labelledby="contact-title"><div className="section-shell"><p className="section-kicker">LET'S CONNECT</p><h2 className="gradient-heading" id="contact-title">LET'S BUILD<br />SOMETHING.</h2><a className="contact-button" href="mailto:jhansen.wilson@gmail.com">EMAIL ME ↗</a><div className="contact-links"><a href="https://github.com/LeonPradagon" target="_blank" rel="noreferrer">GITHUB ↗</a><a href="https://www.linkedin.com/in/jahnsen/" target="_blank" rel="noreferrer">LINKEDIN ↗</a></div></div></section>
    </main>
    <footer className="footer section-shell"><span>© 2026 JHANSEN WILSON</span><a href="#atas">BACK TO TOP ↑</a></footer>
  </>
}
