import type { ReactNode } from 'react'
import { HeadContent, Outlet, Scripts, createRootRoute, useRouterState } from '@tanstack/react-router'
import '../styles.css'

const siteUrl = import.meta.env.VITE_SITE_URL?.replace(/\/$/, '')
const siteDescription = 'Portofolio Jhansen Wilson, full-stack developer yang membangun aplikasi web, API, sistem perusahaan, dan integrasi AI.'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Jhansen Wilson | Full-Stack Developer — Web, API & AI' },
      { name: 'description', content: siteDescription },
      { name: 'theme-color', content: '#0b1b24' },
      { property: 'og:site_name', content: 'Jhansen Wilson' },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'id_ID' },
      { property: 'og:title', content: 'Jhansen Wilson | Full-Stack Developer — Web, API & AI' },
      { property: 'og:description', content: siteDescription },
      ...(siteUrl ? [{ property: 'og:image', content: `${siteUrl}/assets/profile-jhansen.jpeg` }] : []),
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })
  return <RootDocument lang={pathname === '/en' || pathname.startsWith('/en/') ? 'en' : 'id'}><Outlet /></RootDocument>
}

function RootDocument({ children, lang }: Readonly<{ children: ReactNode; lang: 'id' | 'en' }>) {
  return (
    <html lang={lang}>
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  )
}
