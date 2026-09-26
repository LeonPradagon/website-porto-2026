import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { CvProfile } from '../lib/cv'
import { CvDocument } from '../components/CvDocument'

export const Route = createFileRoute('/resume')({
  head: () => ({ meta: [{ title: 'CV | Jhansen Wilson' }, { name: 'description', content: 'CV profesional Jhansen Wilson.' }] }),
  component: PublicResume,
})

function PublicResume() {
  const [profile, setProfile] = useState<CvProfile | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    void fetch('/api/cv/public', { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error('CV belum tersedia.')
      setProfile(await response.json() as CvProfile)
    }).catch(() => {
      if (!controller.signal.aborted) setError(true)
    })
    return () => controller.abort()
  }, [])

  return <main className="cv-public">
    <nav className="cv-public__actions" aria-label="Navigasi CV"><a href="/">JW<span>.</span></a><button className="contact-button" type="button" disabled={!profile} onClick={() => window.print()}>CETAK / SIMPAN PDF</button></nav>
    {profile ? <CvDocument profile={profile} /> : <section className="cv-public__empty" aria-live="polite">
      <h1>{error ? 'CV belum tersedia' : 'Memuat CV…'}</h1>
      <p>{error ? 'Gunakan salinan PDF yang tersedia saat ini.' : 'Jika CV tidak termuat, buka salinan PDF saat ini.'}</p>
      <a className="contact-button" href="/resume/jahnsen-cv.pdf">BUKA CV PDF</a>
    </section>}
  </main>
}
