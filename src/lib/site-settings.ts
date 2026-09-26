export type SiteSettings = {
  role_id: string
  role_en: string
  hero_title_id: string
  hero_title_en: string
  hero_description_id: string
  hero_description_en: string
  about_id: string
  about_en: string
  seo_description_id: string
  seo_description_en: string
  contact_email: string
  github_url: string
  linkedin_url: string
}

export const defaultSiteSettings: SiteSettings = {
  role_id: 'Full-stack developer',
  role_en: 'Full-stack developer',
  hero_title_id: 'Membangun\naplikasi web\ndan sistem digital.',
  hero_title_en: 'Building\nweb applications\nand digital systems.',
  hero_description_id: 'Saya mengembangkan aplikasi web, API, dan integrasi AI—dari antarmuka hingga basis data—untuk kebutuhan produk dan sistem perusahaan.',
  hero_description_en: 'I build web applications, APIs, and AI integrations—from user interfaces to databases—for digital products and business systems.',
  about_id: 'Saya adalah full-stack developer dengan pengalaman lebih dari dua tahun membangun aplikasi web dan sistem perusahaan. Saya mengerjakan antarmuka, backend, API, dan integrasi AI, serta saat ini berkontribusi pada inisiatif digital di PT Asia Sistem Indonesia.',
  about_en: 'I am a full-stack developer with over two years of experience building web applications and business systems. I work across frontend, backend, APIs, and AI integrations, and currently contribute to digital initiatives at PT Asia Sistem Indonesia.',
  seo_description_id: 'Portofolio Jhansen Wilson, full-stack developer dengan pengalaman membangun aplikasi web, REST API, sistem perusahaan, dan integrasi AI.',
  seo_description_en: 'Portfolio of Jhansen Wilson, a full-stack developer building web applications, REST APIs, business systems, and AI integrations.',
  contact_email: 'jhansen.wilson@gmail.com',
  github_url: 'https://github.com/LeonPradagon',
  linkedin_url: 'https://www.linkedin.com/in/jahnsen/',
}

export function localizedSettings(settings: SiteSettings, locale: 'id' | 'en') {
  return locale === 'id'
    ? { role: settings.role_id, heroTitle: settings.hero_title_id, heroDescription: settings.hero_description_id, about: settings.about_id, seoDescription: settings.seo_description_id }
    : { role: settings.role_en, heroTitle: settings.hero_title_en, heroDescription: settings.hero_description_en, about: settings.about_en, seoDescription: settings.seo_description_en }
}
