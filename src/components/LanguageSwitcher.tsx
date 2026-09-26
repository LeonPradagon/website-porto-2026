import type { Locale } from '../lib/i18n'

export function LanguageSwitcher({ locale, href }: { locale: Locale; href: string }) {
  const targetLocale = locale === 'id' ? 'en' : 'id'
  return <a className="language-switch" href={href} lang={targetLocale} aria-label={targetLocale === 'en' ? 'Switch language to English' : 'Ganti bahasa ke Indonesia'}>
    {targetLocale === 'en' ? 'EN' : 'ID'}
  </a>
}
