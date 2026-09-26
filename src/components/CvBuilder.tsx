import type { CvEntry, CvProfile, CvSection } from '../lib/cv'
import { cvSections } from '../lib/cv'
import { CvDocument } from './CvDocument'

type Props = {
  draft: CvProfile
  publishedAt: string | null
  busy: boolean
  onDraftChange: (draft: CvProfile) => void
  onSave: () => void
  onPublish: () => void
}

export function CvBuilder({ draft, publishedAt, busy, onDraftChange, onSave, onPublish }: Props) {
  const setProfile = (key: keyof Omit<CvProfile, 'entries'>, value: string) => onDraftChange({ ...draft, [key]: value })
  const setEntry = (id: string, patch: Partial<CvEntry>) => onDraftChange({
    ...draft,
    entries: draft.entries.map((entry) => entry.id === id ? { ...entry, ...patch } : entry),
  })
  const addEntry = (section: CvSection) => onDraftChange({
    ...draft,
    entries: [...draft.entries, {
      id: crypto.randomUUID(), section, title: '', organization: '', location: '', start_date: '', end_date: '',
      details: [], url: '', sort_order: draft.entries.filter((entry) => entry.section === section).length, visible: true,
    }],
  })
  const removeEntry = (id: string) => onDraftChange({ ...draft, entries: draft.entries.filter((entry) => entry.id !== id) })
  const moveEntry = (entry: CvEntry, direction: -1 | 1) => {
    const sectionEntries = draft.entries.filter((item) => item.section === entry.section).sort((a, b) => a.sort_order - b.sort_order)
    const index = sectionEntries.findIndex((item) => item.id === entry.id)
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= sectionEntries.length) return
    ;[sectionEntries[index], sectionEntries[nextIndex]] = [sectionEntries[nextIndex], sectionEntries[index]]
    const orders = new Map(sectionEntries.map((item, order) => [item.id, order]))
    onDraftChange({ ...draft, entries: draft.entries.map((item) => orders.has(item.id) ? { ...item, sort_order: orders.get(item.id)! } : item) })
  }
  const profileFields: Array<[keyof Omit<CvProfile, 'entries'>, string, string]> = [
    ['name', 'Nama lengkap', 'text'], ['headline', 'Jabatan / headline', 'text'], ['email', 'Email', 'email'],
    ['phone', 'Telepon (opsional)', 'text'], ['location', 'Lokasi (opsional)', 'text'],
    ['linkedin_url', 'LinkedIn URL (opsional)', 'url'], ['github_url', 'GitHub URL (opsional)', 'url'],
  ]

  return <section className="admin-section cv-builder">
    <h2>CV BUILDER / ATS CV</h2>
    <p className="cv-builder__state">Draft disimpan terpisah dari versi publik. Terakhir terbit: {publishedAt ? new Date(publishedAt).toLocaleString() : 'Belum pernah terbit'}.</p>
    <div className="cv-builder__grid">
      <div className="cv-builder__editor">
        <h3>IDENTITAS DAN RINGKASAN</h3>
        <div className="admin-project-form">
          {profileFields.map(([key, label, type]) => <label key={key}>{label}<input type={type} value={draft[key]} onChange={(event) => setProfile(key, event.target.value)} /></label>)}
          <label className="admin-project-form__wide">Ringkasan<textarea value={draft.summary} maxLength={3000} onChange={(event) => setProfile('summary', event.target.value)} /></label>
        </div>
        {cvSections.map(({ id, label }) => <section className="cv-builder__section" key={id}>
          <div className="cv-builder__section-heading"><h3>{label.toUpperCase()}</h3><button className="outline-button" type="button" onClick={() => addEntry(id)}>ADD</button></div>
          {draft.entries.filter((entry) => entry.section === id).sort((a, b) => a.sort_order - b.sort_order).map((entry, index, list) => <fieldset className="cv-builder__entry" key={entry.id}>
            <legend>{entry.title || `Entri ${index + 1}`}</legend>
            <label>Judul / jabatan<input value={entry.title} maxLength={200} onChange={(event) => setEntry(entry.id, { title: event.target.value })} /></label>
            <label>Organisasi / institusi<input value={entry.organization} maxLength={200} onChange={(event) => setEntry(entry.id, { organization: event.target.value })} /></label>
            <label>Lokasi<input value={entry.location} maxLength={120} onChange={(event) => setEntry(entry.id, { location: event.target.value })} /></label>
            <label>Mulai<input value={entry.start_date} maxLength={50} onChange={(event) => setEntry(entry.id, { start_date: event.target.value })} placeholder="Mei 2025" /></label>
            <label>Selesai<input value={entry.end_date} maxLength={50} onChange={(event) => setEntry(entry.id, { end_date: event.target.value })} placeholder="Sekarang" /></label>
            <label className="cv-builder__wide">Pencapaian / detail<textarea value={entry.details.join('\n')} onChange={(event) => setEntry(entry.id, { details: event.target.value.split('\n') })} placeholder="Satu butir per baris" /></label>
            <label className="cv-builder__wide">Tautan (opsional)<input type="url" value={entry.url} onChange={(event) => setEntry(entry.id, { url: event.target.value })} /></label>
            <label className="admin-check"><input type="checkbox" checked={entry.visible} onChange={(event) => setEntry(entry.id, { visible: event.target.checked })} /> Tampilkan di CV</label>
            <div className="admin-row-actions"><button className="outline-button" type="button" disabled={index === 0} onClick={() => moveEntry(entry, -1)}>UP</button><button className="outline-button" type="button" disabled={index === list.length - 1} onClick={() => moveEntry(entry, 1)}>DOWN</button><button className="outline-button" type="button" onClick={() => removeEntry(entry.id)}>DELETE</button></div>
          </fieldset>)}
        </section>)}
        <div className="admin-form-actions"><button className="contact-button" type="button" disabled={busy} onClick={onSave}>{busy ? 'SAVING…' : 'SAVE DRAFT'}</button><button className="outline-button" type="button" disabled={busy} onClick={onPublish}>{busy ? 'PUBLISHING…' : 'PUBLISH CV'}</button><button className="outline-button" type="button" onClick={() => window.print()}>PRINT PREVIEW</button></div>
        <p className="cv-builder__state">Ekspor memakai print stylesheet A4 satu kolom. Pilih “Save as PDF” pada dialog cetak.</p>
      </div>
      <div className="cv-builder__preview"><h3>LIVE PREVIEW</h3><CvDocument profile={draft} /></div>
    </div>
  </section>
}
