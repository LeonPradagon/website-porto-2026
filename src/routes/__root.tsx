import type { ReactNode } from 'react'
import { HeadContent, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import '../styles.css'

const siteUrl = import.meta.env.VITE_SITE_URL?.replace(/\/$/, '')
const siteDescription = 'Portofolio Jhansen Wilson: proyek full-stack, sistem perusahaan, integrasi AI, dan keahlian teknis.'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Jhansen Wilson — Full-Stack Developer' },
      { name: 'description', content: siteDescription },
      { name: 'theme-color', content: '#0b1b24' },
      { property: 'og:site_name', content: 'Jhansen Wilson' },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'id_ID' },
      { property: 'og:title', content: 'Jhansen Wilson — Full-Stack Developer' },
      { property: 'og:description', content: siteDescription },
      ...(siteUrl ? [{ property: 'og:image', content: `${siteUrl}/assets/profile-jhansen.jpeg` }] : []),
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      ...(siteUrl ? [{ rel: 'canonical', href: `${siteUrl}/` }] : []),
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return <RootDocument><Outlet /></RootDocument>
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  )
}
