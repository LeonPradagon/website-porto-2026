import type { CvProfile } from '../lib/cv'
import { cvSections } from '../lib/cv'

export function CvDocument({ profile }: { profile: CvProfile }) {
  const entries = profile.entries.filter((entry) => entry.visible)
  return <article className="cv-sheet">
    <header className="cv-sheet__header">
      <h1>{profile.name}</h1>
      <p className="cv-sheet__headline">{profile.headline}</p>
      <address className="cv-sheet__contact">
        {[profile.phone, profile.email, profile.linkedin_url, profile.github_url, profile.location].filter(Boolean).map((value) =>
          value.startsWith('https://') ? <a href={value} key={value}>{value}</a> : <span key={value}>{value}</span>)}
      </address>
    </header>
    {profile.summary.trim() && <section className="cv-sheet__section"><h2>Summary</h2><p>{profile.summary}</p></section>}
    {cvSections.map(({ id, label }) => {
      const sectionEntries = entries.filter((entry) => entry.section === id).sort((a, b) => a.sort_order - b.sort_order)
      if (!sectionEntries.length) return null
      return <section className="cv-sheet__section" key={id}>
        <h2>{cvSections.find((section) => section.id === id)?.documentLabel ?? label}</h2>
        {sectionEntries.map((entry) => <article className="cv-sheet__entry" key={entry.id}>
          <div className="cv-sheet__entry-heading">
            <h3>{entry.title}</h3>
            {(entry.start_date || entry.end_date) && <p>{[entry.start_date, entry.end_date].filter(Boolean).join(' – ')}</p>}
          </div>
          {(entry.organization || entry.location) && <p className="cv-sheet__organization">{[entry.organization, entry.location].filter(Boolean).join(' · ')}</p>}
          {entry.url && <p><a href={entry.url}>{entry.url}</a></p>}
          {!!entry.details.filter(Boolean).length && <ul>{entry.details.filter(Boolean).map((detail, index) => <li key={`${entry.id}-${index}`}>{detail}</li>)}</ul>}
        </article>)}
      </section>
    })}
  </article>
}
