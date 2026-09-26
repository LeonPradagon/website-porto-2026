import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { defaultSiteSettings, type SiteSettings } from '../lib/site-settings'
import { optimizePngLosslessly } from '../lib/lossless-image-optimization'
import { defaultCvProfile, type CvProfile } from '../lib/cv'
import { CvBuilder } from '../components/CvBuilder'
import '../styles/admin-login.css'

type ProjectRow = {
  id: string
  slug: string
  title: string
  category: 'Professional' | 'Personal'
  description: string
  role: string
  year: number | null
  stack: string[]
  image_url: string
  image_alt: string
  demo_url: string | null
  repository_url: string
  editorial: boolean
  featured: boolean
  status: 'draft' | 'published'
  sort_order: number
}

const emptyProject: Omit<ProjectRow, 'id'> = {
  slug: '', title: '', category: 'Professional', description: '', role: '', year: null, stack: [],
  image_url: '', image_alt: '', demo_url: null, repository_url: '', editorial: false, featured: false, status: 'draft', sort_order: 0,
}

type ContactMessage = {
  id: string
  name: string
  email: string
  message: string
  created_at: string
  read_at: string | null
}

type MediaAsset = {
  id: string
  storage_path: string
  public_url: string
  media_type: 'image' | 'video'
  mime_type: string
  size_bytes: number
  alt_text: string
  created_at: string
}

async function adminApi(path: string, init: RequestInit = {}, sessionToken?: string) {
  if (!supabase) throw new Error('Supabase belum dikonfigurasi.')
  const token = sessionToken ?? (await supabase.auth.getSession()).data.session?.access_token
  if (!token) throw new Error('Sesi login sudah berakhir. Silakan masuk kembali.')
  const response = await fetch(`/api${path}`, {
    ...init,
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
      Authorization: `Bearer ${token}`,
    },
  })
  if (!response.ok) {
    const error = await response.json().catch(() => null) as { message?: string | string[] } | null
    throw new Error(Array.isArray(error?.message) ? error.message.join(', ') : error?.message ?? `API error (${response.status})`)
  }
  return response.status === 204 ? null : response.json()
}

export const Route = createFileRoute('/admin')({ component: Admin })

function Admin() {
  const [user, setUser] = useState<User | null>(null)
  const [authorized, setAuthorized] = useState(false)
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [media, setMedia] = useState<MediaAsset[]>([])
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings)
  const [cvDraft, setCvDraft] = useState<CvProfile>(defaultCvProfile)
  const [cvPublishedAt, setCvPublishedAt] = useState<string | null>(null)
  const [form, setForm] = useState(emptyProject)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [mediaBusy, setMediaBusy] = useState(false)
  const [cvBusy, setCvBusy] = useState(false)

  const loadProjects = async () => {
    if (!supabase) return
    try {
      setProjects(await adminApi('/admin/projects') as ProjectRow[])
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Gagal memuat proyek.')
    }
  }

  const loadMessages = async () => {
    try {
      setMessages(await adminApi('/admin/messages') as ContactMessage[])
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Gagal memuat pesan.')
    }
  }

  const loadSettings = async () => {
    try {
      setSettings(await adminApi('/settings') as SiteSettings)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Gagal memuat pengaturan situs.')
    }
  }

  const loadMedia = async () => {
    try {
      setMedia(await adminApi('/admin/media') as MediaAsset[])
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Gagal memuat media.')
    }
  }

  const loadCv = async () => {
    try {
      const result = await adminApi('/admin/cv') as { draft: CvProfile; published_at: string | null }
      setCvDraft(result.draft)
      setCvPublishedAt(result.published_at)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Gagal memuat CV.')
    }
  }

  const verifyAdmin = async (currentUser: User | null, sessionToken?: string) => {
    setUser(currentUser)
    if (!supabase || !currentUser) {
      setAuthorized(false)
      setProjects([])
      return
    }
    try {
      await adminApi('/admin/me', {}, sessionToken)
      setAuthorized(true)
      await loadProjects()
      await loadMessages()
      await loadSettings()
      await loadMedia()
      await loadCv()
    } catch (error) {
      setAuthorized(false)
      setNotice(error instanceof Error ? error.message : 'Akun ini belum tercatat sebagai admin situs.')
    }
  }

  useEffect(() => {
    if (!supabase) return
    void supabase.auth.getSession().then(({ data }) => verifyAdmin(data.session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session) {
        setAuthorized(false)
        setProjects([])
        setMessages([])
        setMedia([])
        setCvDraft(defaultCvProfile)
        setCvPublishedAt(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase) return
    const values = new FormData(event.currentTarget)
    setBusy(true)
    setNotice('')
    const { data, error } = await supabase.auth.signInWithPassword({ email: String(values.get('email')), password: String(values.get('password')) })
    if (error) setNotice(error.message)
    else await verifyAdmin(data.user, data.session.access_token)
    setBusy(false)
  }

  const saveProject = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase || !authorized) return
    const values = new FormData(event.currentTarget)
      const project = {
      slug: String(values.get('slug')).trim(),
      title: String(values.get('title')).trim(),
      category: String(values.get('category')),
      description: String(values.get('description')).trim(),
      role: String(values.get('role')).trim(),
      year: values.get('year') ? Number(values.get('year')) : null,
      stack: String(values.get('stack')).split(',').map((item) => item.trim()).filter(Boolean),
      image_url: String(values.get('image_url')).trim(),
      image_alt: String(values.get('image_alt')).trim(),
      demo_url: String(values.get('demo_url')).trim() || null,
      repository_url: String(values.get('repository_url')).trim(),
      editorial: values.get('editorial') === 'on',
      featured: values.get('featured') === 'on',
      status: String(values.get('status')),
      sort_order: Number(values.get('sort_order')) || 0,
    }
    setBusy(true)
    try {
      await adminApi(editingId ? `/admin/projects/${editingId}` : '/admin/projects', {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(project),
      })
      setNotice('Proyek berhasil disimpan.')
      setForm(emptyProject)
      setEditingId(null)
      await loadProjects()
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Gagal menyimpan proyek.')
    } finally {
      setBusy(false)
    }
  }

  const removeProject = async (project: ProjectRow) => {
    if (!supabase || !window.confirm(`Hapus proyek “${project.title}”?`)) return
    try {
      await adminApi(`/admin/projects/${project.id}`, { method: 'DELETE' })
      setNotice('Proyek dihapus.')
      await loadProjects()
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Gagal menghapus proyek.')
    }
  }

  const saveSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    const updated = Object.fromEntries(Object.keys(defaultSiteSettings).map((key) => [key, String(values.get(key) ?? '')])) as SiteSettings
    setBusy(true)
    try {
      setSettings(await adminApi('/admin/settings', { method: 'PUT', body: JSON.stringify(updated) }) as SiteSettings)
      setNotice('Pengaturan situs berhasil disimpan dan langsung diterbitkan.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Gagal menyimpan pengaturan situs.')
    } finally {
      setBusy(false)
    }
  }

  const saveCvDraft = async () => {
    setCvBusy(true)
    try {
      const result = await adminApi('/admin/cv', { method: 'PUT', body: JSON.stringify(cvDraft) }) as { draft: CvProfile; published_at: string | null }
      setCvDraft(result.draft)
      setCvPublishedAt(result.published_at)
      setNotice('Draft CV tersimpan. Versi publik tidak berubah.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Gagal menyimpan draft CV.')
    } finally {
      setCvBusy(false)
    }
  }

  const publishCvDraft = async () => {
    setCvBusy(true)
    try {
      const saved = await adminApi('/admin/cv', { method: 'PUT', body: JSON.stringify(cvDraft) }) as { draft: CvProfile; published_at: string | null }
      const result = await adminApi('/admin/cv/publish', { method: 'POST' }) as { published: CvProfile; published_at: string }
      setCvDraft(saved.draft)
      setCvPublishedAt(result.published_at)
      setNotice('CV diterbitkan. Halaman publik kini memakai versi terbaru.')
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Gagal menerbitkan CV.')
    } finally {
      setCvBusy(false)
    }
  }

  const setMessageRead = async (message: ContactMessage, read: boolean) => {
    try {
      await adminApi(`/admin/messages/${message.id}/read`, { method: 'PATCH', body: JSON.stringify({ read }) })
      await loadMessages()
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Gagal memperbarui status pesan.')
    }
  }

  const removeMessage = async (message: ContactMessage) => {
    if (!window.confirm(`Hapus pesan dari “${message.name}”?`)) return
    try {
      await adminApi(`/admin/messages/${message.id}`, { method: 'DELETE' })
      setNotice('Pesan dihapus.')
      await loadMessages()
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Gagal menghapus pesan.')
    }
  }

  const uploadMedia = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase) return
    const form = event.currentTarget
    const values = new FormData(form)
    const file = values.get('file')
    const altText = String(values.get('alt_text') ?? '').trim()
    if (!(file instanceof File) || !file.size) {
      setNotice('Pilih file gambar atau video terlebih dahulu.')
      return
    }
    const image = file.type.startsWith('image/')
    const imageMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
    const videoMimes = ['video/mp4', 'video/webm']
    if (!(imageMimes.includes(file.type) || videoMimes.includes(file.type))) {
      setNotice('Format yang didukung: JPEG, PNG, WebP, AVIF, MP4, atau WebM.')
      return
    }
    if ((image && file.size > 15 * 1024 * 1024) || file.size > 50 * 1024 * 1024) {
      setNotice(image ? 'Ukuran gambar maksimal 15 MB.' : 'Ukuran video maksimal 50 MB.')
      return
    }
    if (!altText || altText.length > 500) {
      setNotice('Isi alt text gambar atau deskripsi video (maksimal 500 karakter).')
      return
    }
    setMediaBusy(true)
    setNotice(file.type === 'image/png' ? 'Mengoptimalkan PNG secara lossless…' : 'Menyiapkan file asli…')
    let storagePath = ''
    try {
      const uploadFile = await optimizePngLosslessly(file)
      const savedBytes = file.size - uploadFile.size
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Sesi login sudah berakhir. Silakan masuk kembali.')
      const extension = uploadFile.name.split('.').pop()?.toLowerCase() ?? ''
      storagePath = `${session.user.id}/${crypto.randomUUID()}.${extension}`
      const { error } = await supabase.storage.from('portfolio-media').upload(storagePath, uploadFile, {
        cacheControl: '31536000',
        contentType: uploadFile.type,
        upsert: false,
      })
      if (error) throw new Error(error.message)
      try {
        await adminApi('/admin/media', {
          method: 'POST',
          body: JSON.stringify({ storage_path: storagePath, mime_type: uploadFile.type, size_bytes: uploadFile.size, alt_text: altText }),
        })
      } catch (error) {
        await supabase.storage.from('portfolio-media').remove([storagePath])
        throw error
      }
      const savings = savedBytes > 0 ? ` PNG lossless menghemat ${(savedBytes / 1024).toFixed(0)} KB.` : file.type === 'image/png' ? ' PNG tetap asli karena optimasi tidak mengurangi ukuran.' : ' Format ini diunggah tanpa perubahan agar kualitas tetap sama.'
      setNotice(`Media berhasil diunggah.${savings}`)
      form.reset()
      await loadMedia()
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Upload gagal. Silakan coba lagi.')
    } finally {
      setMediaBusy(false)
    }
  }

  const removeMedia = async (asset: MediaAsset) => {
    if (!window.confirm(`Hapus media “${asset.alt_text}”?`)) return
    try {
      await adminApi(`/admin/media/${asset.id}`, { method: 'DELETE' })
      setNotice('Media dihapus.')
      await loadMedia()
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Gagal menghapus media.')
    }
  }

  if (!supabase) return <AdminShell><p>Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY.</p></AdminShell>

  if (!user) return <main className="admin-login-screen">
    <a className="admin-login-brand" href="/">JW<span>.</span><small>PORTFOLIO / ADMIN</small></a>
    <div className="admin-login-layout">
      <aside className="admin-login-story" aria-label="Admin portfolio">
        <p className="admin-login-kicker">PRIVATE WORKSPACE / 01</p>
        <div className="admin-login-art" aria-hidden="true"><span>JW</span><i /><b /></div>
        <p className="admin-login-story__caption">CONTENT<br />SHAPES<br /><em>THE STORY.</em></p>
        <div className="admin-login-story__footer"><span>PORTFOLIO CMS</span><span>SECURE ACCESS</span></div>
      </aside>
      <section className="admin-login-panel" aria-labelledby="admin-login-title">
        <p className="section-kicker">SIGN IN / ADMIN</p>
        <h1 id="admin-login-title">Welcome<br /><em>back.</em></h1>
        <p className="admin-login-intro">Masuk untuk mengelola proyek, CV, media, dan konten portofolio.</p>
        {notice && <p className="admin-login-notice" role="alert">{notice}</p>}
        <form className="admin-login-form" onSubmit={signIn}>
          <label>Email address<input type="email" name="email" autoComplete="username" placeholder="nama@email.com" required /></label>
          <label>Password<input type="password" name="password" autoComplete="current-password" placeholder="Masukkan password" required /></label>
          <button className="contact-button" type="submit" disabled={busy}>{busy ? 'SIGNING IN…' : 'SIGN IN'} <span aria-hidden="true">↗</span></button>
        </form>
        <p className="admin-login-security">Akses dashboard memerlukan akun admin terdaftar.</p>
      </section>
    </div>
    <a className="admin-login-back" href="/">← KEMBALI KE PORTOFOLIO</a>
  </main>

  return <AdminShell>
    <p className="section-kicker">PRIVATE AREA / ADMIN</p>
    <h1>PORTFOLIO CMS</h1>
    {notice && <p className="admin-notice" role="status">{notice}</p>}
    {!authorized ? <button className="outline-button" onClick={() => void supabase?.auth.signOut()}>SIGN OUT</button> : <>
      <div className="admin-toolbar"><p>Signed in as {user.email}</p><button className="outline-button" onClick={() => void supabase?.auth.signOut()}>SIGN OUT</button></div>
      <section className="admin-section">
        <h2>SITE PROFILE / HERO / SEO</h2>
        <form key={JSON.stringify(settings)} className="admin-project-form" onSubmit={saveSettings}>
          <label>Role (Indonesia)<input name="role_id" defaultValue={settings.role_id} maxLength={80} required /></label>
          <label>Role (English)<input name="role_en" defaultValue={settings.role_en} maxLength={80} required /></label>
          <label>Hero headline (Indonesia)<textarea name="hero_title_id" defaultValue={settings.hero_title_id} maxLength={180} required /></label>
          <label>Hero headline (English)<textarea name="hero_title_en" defaultValue={settings.hero_title_en} maxLength={180} required /></label>
          <label>Hero description (Indonesia)<textarea name="hero_description_id" defaultValue={settings.hero_description_id} maxLength={400} required /></label>
          <label>Hero description (English)<textarea name="hero_description_en" defaultValue={settings.hero_description_en} maxLength={400} required /></label>
          <label className="admin-project-form__wide">About (Indonesia)<textarea name="about_id" defaultValue={settings.about_id} maxLength={2000} required /></label>
          <label className="admin-project-form__wide">About (English)<textarea name="about_en" defaultValue={settings.about_en} maxLength={2000} required /></label>
          <label>SEO description (Indonesia)<textarea name="seo_description_id" defaultValue={settings.seo_description_id} maxLength={300} required /></label>
          <label>SEO description (English)<textarea name="seo_description_en" defaultValue={settings.seo_description_en} maxLength={300} required /></label>
          <label>Contact email<input name="contact_email" type="email" defaultValue={settings.contact_email} maxLength={254} required /></label>
          <label>GitHub URL<input name="github_url" type="url" defaultValue={settings.github_url} required /></label>
          <label>LinkedIn URL<input name="linkedin_url" type="url" defaultValue={settings.linkedin_url} required /></label>
          <div className="admin-form-actions"><button className="contact-button" type="submit" disabled={busy}>{busy ? 'SAVING…' : 'SAVE AND PUBLISH'}</button><p>Konten langsung tampil untuk semua pengunjung; pratinjau draft belum tersedia.</p></div>
        </form>
      </section>
      <CvBuilder draft={cvDraft} publishedAt={cvPublishedAt} busy={cvBusy} onDraftChange={setCvDraft} onSave={() => void saveCvDraft()} onPublish={() => void publishCvDraft()} />
      <section className="admin-section">
        <h2>{editingId ? 'EDIT PROJECT' : 'ADD PROJECT'}</h2>
        <form className="admin-project-form" onSubmit={saveProject}>
          <label>Title<input name="title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></label>
          <label>Slug<input name="slug" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} pattern="[a-z0-9]+(-[a-z0-9]+)*" required /></label>
          <label>Category<select name="category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as ProjectRow['category'] })}><option>Professional</option><option>Personal</option></select></label>
          <label>Status<select name="status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as ProjectRow['status'] })}><option value="draft">Draft</option><option value="published">Published</option></select></label>
          <label className="admin-project-form__wide">Description<textarea name="description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required /></label>
          <label>Role<input name="role" maxLength={200} value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} /></label>
          <label>Year<input name="year" type="number" min="1990" max="2100" value={form.year ?? ''} onChange={(event) => setForm({ ...form, year: event.target.value ? Number(event.target.value) : null })} /></label>
          <label>Tech stack<input name="stack" value={form.stack.join(', ')} onChange={(event) => setForm({ ...form, stack: event.target.value.split(',').map((item) => item.trim()) })} placeholder="React, TypeScript" /></label>
          <label>Image URL<input name="image_url" type="text" pattern="(https://|/assets/).*" value={form.image_url} onChange={(event) => setForm({ ...form, image_url: event.target.value })} required /></label>
          <label>Image alt text<input name="image_alt" maxLength={500} value={form.image_alt} onChange={(event) => setForm({ ...form, image_alt: event.target.value })} /></label>
          <label>Demo URL<input name="demo_url" type="url" pattern="https://.*" value={form.demo_url ?? ''} onChange={(event) => setForm({ ...form, demo_url: event.target.value || null })} /></label>
          <label>Repository URL<input name="repository_url" type="url" value={form.repository_url} onChange={(event) => setForm({ ...form, repository_url: event.target.value })} pattern="https://.*" required /></label>
          <label>Order<input name="sort_order" type="number" min="0" value={form.sort_order} onChange={(event) => setForm({ ...form, sort_order: Number(event.target.value) })} /></label>
          <label className="admin-check"><input name="editorial" type="checkbox" checked={form.editorial} onChange={(event) => setForm({ ...form, editorial: event.target.checked })} /> Editorial asset</label>
          <label className="admin-check"><input name="featured" type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} /> Featured on homepage</label>
          <div className="admin-form-actions"><button className="contact-button" type="submit" disabled={busy}>{busy ? 'SAVING…' : 'SAVE PROJECT'}</button>{editingId && <button className="outline-button" type="button" onClick={() => { setForm(emptyProject); setEditingId(null) }}>CANCEL</button>}</div>
        </form>
      </section>
      <section className="admin-section"><h2>PROJECTS ({projects.length})</h2><div className="admin-project-list">
        {projects.map((project) => <article className="admin-project-row" key={project.id}>
          <div><span>{project.status.toUpperCase()} / {project.category}</span><h3>{project.title}</h3><small>/{project.slug}</small></div>
          <div className="admin-row-actions"><button className="outline-button" onClick={() => { setEditingId(project.id); setForm({ ...project }) }}>EDIT</button><button className="outline-button" onClick={() => void removeProject(project)}>DELETE</button></div>
        </article>)}
      </div></section>
      <section className="admin-section">
        <h2>MEDIA LIBRARY ({media.length})</h2>
        <form className="admin-media-upload" onSubmit={uploadMedia}>
          <label>Image or video<input type="file" name="file" accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm" required /></label>
          <label>Alt text / video description<input name="alt_text" maxLength={500} required /></label>
          <button className="contact-button" type="submit" disabled={mediaBusy}>{mediaBusy ? 'UPLOADING…' : 'UPLOAD MEDIA'}</button>
          <p>PNG dioptimalkan secara lossless dan hanya dipakai jika lebih kecil. JPEG, WebP, AVIF, dan video tetap asli agar kualitasnya tidak berubah. Gambar maks. 15 MB; video maks. 50 MB.</p>
        </form>
        <div className="admin-media-grid">{media.map((asset) => <article className="admin-media-card" key={asset.id}>
          {asset.media_type === 'image' ? <img src={asset.public_url} alt={asset.alt_text} loading="lazy" /> : <video src={asset.public_url} controls preload="metadata" aria-label={asset.alt_text} />}
          <div><span>{asset.media_type.toUpperCase()} / {(asset.size_bytes / (1024 * 1024)).toFixed(1)} MB</span><p>{asset.alt_text}</p><small>{asset.mime_type}</small></div>
          <div className="admin-row-actions">{asset.media_type === 'image' && <button className="outline-button" onClick={() => setForm((current) => ({ ...current, image_url: asset.public_url, image_alt: asset.alt_text }))}>USE FOR PROJECT</button>}<button className="outline-button" onClick={() => void removeMedia(asset)}>DELETE</button></div>
        </article>)}</div>
      </section>
      <section className="admin-section"><h2>CONTACT MESSAGES ({messages.filter((message) => !message.read_at).length} NEW)</h2><div className="admin-message-list">
        {messages.length === 0 ? <p>Belum ada pesan.</p> : messages.map((message) => <article className="admin-message-row" key={message.id}>
          <div className="admin-message-meta"><span>{message.read_at ? 'READ' : 'NEW'} / {new Date(message.created_at).toLocaleString()}</span><h3>{message.name}</h3><a href={`mailto:${message.email}`}>{message.email}</a></div>
          <p>{message.message}</p>
          <div className="admin-row-actions"><button className="outline-button" onClick={() => void setMessageRead(message, !message.read_at)}>{message.read_at ? 'MARK UNREAD' : 'MARK READ'}</button><button className="outline-button" onClick={() => void removeMessage(message)}>DELETE</button></div>
        </article>)}
      </div></section>
    </>}
  </AdminShell>
}

function AdminShell({ children }: Readonly<{ children: ReactNode }>) {
  return <main className="admin-shell"><a className="hero-brand" href="/">JW<span>.</span></a>{children}</main>
}
