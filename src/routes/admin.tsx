import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { defaultSiteSettings, type SiteSettings } from '../lib/site-settings'
import { optimizePngLosslessly } from '../lib/lossless-image-optimization'
import { defaultCvProfile, type CvProfile } from '../lib/cv'
import { CvBuilder } from '../components/CvBuilder'
import '../styles/admin-login.css'
import '../styles/admin-cms.css'

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

type AdminRole = 'owner' | 'admin'
type AdminMenu = 'dashboard' | 'projects' | 'cv' | 'media' | 'messages' | 'settings' | 'users' | 'audit' | 'account'

const adminMenus: Array<{ id: AdminMenu; label: string; index: string }> = [
  { id: 'dashboard', label: 'Dashboard', index: '01' },
  { id: 'projects', label: 'Projects', index: '02' },
  { id: 'cv', label: 'CV Builder', index: '03' },
  { id: 'media', label: 'Media Library', index: '04' },
  { id: 'messages', label: 'Messages', index: '05' },
  { id: 'settings', label: 'Site Settings', index: '06' },
  { id: 'users', label: 'User Management', index: '07' },
  { id: 'audit', label: 'Audit Trail', index: '08' },
  { id: 'account', label: 'My Account', index: '09' },
]

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

type AdminMember = {
  user_id: string
  email: string
  role: AdminRole
  created_at: string
  last_sign_in_at: string | null
  status: 'active' | 'invited'
}

type AdminAuditEvent = {
  id: string
  actor_user_id: string
  actor_email: string
  action: string
  entity: string
  entity_id: string | null
  metadata: { method?: string; route?: string; status?: number }
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
  const [adminRole, setAdminRole] = useState<AdminRole>('admin')
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [media, setMedia] = useState<MediaAsset[]>([])
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings)
  const [cvDraft, setCvDraft] = useState<CvProfile>(defaultCvProfile)
  const [cvPublishedAt, setCvPublishedAt] = useState<string | null>(null)
  const [adminMembers, setAdminMembers] = useState<AdminMember[]>([])
  const [auditEvents, setAuditEvents] = useState<AdminAuditEvent[]>([])
  const [auditTotal, setAuditTotal] = useState(0)
  const [auditOffset, setAuditOffset] = useState(0)
  const [inviteEmail, setInviteEmail] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [passwordRecovery, setPasswordRecovery] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [activeMenu, setActiveMenu] = useState<AdminMenu>('dashboard')
  const [form, setForm] = useState(emptyProject)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(false)
  const [mediaBusy, setMediaBusy] = useState(false)
  const [cvBusy, setCvBusy] = useState(false)
  const [usersBusy, setUsersBusy] = useState(false)
  const [auditBusy, setAuditBusy] = useState(false)
  const [passwordBusy, setPasswordBusy] = useState(false)

  const loadProjects = async (sessionToken?: string) => {
    if (!supabase) return false
    try {
      setProjects(await adminApi('/admin/projects', {}, sessionToken) as ProjectRow[])
      return true
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Gagal memuat proyek.')
      return false
    }
  }

  const loadMessages = async (sessionToken?: string) => {
    try {
      setMessages(await adminApi('/admin/messages', {}, sessionToken) as ContactMessage[])
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Gagal memuat pesan.')
    }
  }

  const loadSettings = async (sessionToken?: string) => {
    try {
      setSettings(await adminApi('/settings', {}, sessionToken) as SiteSettings)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Gagal memuat pengaturan situs.')
    }
  }

  const loadMedia = async (sessionToken?: string) => {
    try {
      setMedia(await adminApi('/admin/media', {}, sessionToken) as MediaAsset[])
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Gagal memuat media.')
    }
  }

  const loadCv = async (sessionToken?: string) => {
    try {
      const result = await adminApi('/admin/cv', {}, sessionToken) as { draft: CvProfile; published_at: string | null }
      setCvDraft(result.draft)
      setCvPublishedAt(result.published_at)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Gagal memuat CV.')
    }
  }

  const loadAdminRole = async (sessionToken?: string) => {
    try {
      const result = await adminApi('/admin/me', {}, sessionToken) as { role: AdminRole }
      setAdminRole(result.role)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Gagal memuat profil admin.')
    }
  }

  const loadUsers = async (sessionToken?: string) => {
    setUsersBusy(true)
    try {
      setAdminMembers(await adminApi('/admin/users', {}, sessionToken) as AdminMember[])
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Gagal memuat pengguna CMS.')
    } finally {
      setUsersBusy(false)
    }
  }

  const loadAudit = async (offset = 0, sessionToken?: string) => {
    setAuditBusy(true)
    try {
      const result = await adminApi(`/admin/audit?limit=50&offset=${offset}`, {}, sessionToken) as { items: AdminAuditEvent[]; total: number }
      setAuditEvents(result.items)
      setAuditTotal(result.total)
      setAuditOffset(offset)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Gagal memuat audit trail.')
    } finally {
      setAuditBusy(false)
    }
  }

  const selectMenu = (menu: AdminMenu) => {
    setActiveMenu(menu)
    setNotice('')
    if (menu === 'users') void loadUsers()
    if (menu === 'audit') void loadAudit()
  }

  const verifyAdmin = async (currentUser: User | null, sessionToken?: string) => {
    setUser(currentUser)
    if (!supabase || !currentUser) {
      setAuthorized(false)
      setCheckingAdmin(false)
      setProjects([])
      return
    }
    setCheckingAdmin(true)
    setNotice('')
    try {
      const hasAdminAccess = await loadProjects(sessionToken)
      if (!hasAdminAccess) {
        setAuthorized(false)
        return
      }
      setAuthorized(true)
      setCheckingAdmin(false)
      await Promise.all([
        loadAdminRole(sessionToken),
        loadMessages(sessionToken),
        loadSettings(sessionToken),
        loadMedia(sessionToken),
        loadCv(sessionToken),
      ])
    } catch (error) {
      setAuthorized(false)
      setNotice(error instanceof Error ? error.message : 'Akun ini belum tercatat sebagai admin situs.')
    } finally {
      setCheckingAdmin(false)
    }
  }

  useEffect(() => {
    if (!supabase) return
    void supabase.auth.getSession().then(({ data }) => verifyAdmin(data.session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecovery(true)
        setActiveMenu('account')
        setAuthorized(false)
      }
      if (session && event === 'SIGNED_IN') {
        setAuthorized(false)
        setCheckingAdmin(true)
      }
      if (!session) {
        setAuthorized(false)
        setCheckingAdmin(false)
        setAdminRole('admin')
        setActiveMenu('dashboard')
        setPasswordRecovery(false)
        setProjects([])
        setMessages([])
        setMedia([])
        setAdminMembers([])
        setAuditEvents([])
        setAuditTotal(0)
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
    const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail || String(values.get('email')), password: String(values.get('password')) })
    if (error) setNotice(error.message)
    else await verifyAdmin(data.user, data.session.access_token)
    setBusy(false)
  }

  const inviteAdmin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setUsersBusy(true)
    try {
      const result = await adminApi('/admin/users', { method: 'POST', body: JSON.stringify({ email: inviteEmail }) }) as { email: string; invitation_sent: boolean }
      setInviteEmail('')
      setNotice(result.invitation_sent
        ? `Invitation sent to ${result.email}. They get admin access after accepting.`
        : `CMS admin access granted to existing account ${result.email}.`)
      await loadUsers()
      await loadAudit()
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Failed to invite CMS admin.')
    } finally {
      setUsersBusy(false)
    }
  }

  const revokeAdminAccess = async (member: AdminMember) => {
    if (!window.confirm(`Revoke CMS access for ${member.email}? Their Supabase Auth account will remain.`)) return
    setUsersBusy(true)
    try {
      await adminApi(`/admin/users/${member.user_id}`, { method: 'DELETE' })
      setNotice(`CMS access revoked for ${member.email}.`)
      await loadUsers()
      await loadAudit()
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Failed to revoke CMS access.')
    } finally {
      setUsersBusy(false)
    }
  }

  const sendAdminPasswordReset = async (member: AdminMember) => {
    if (!window.confirm(`Send a password reset link to ${member.email}?`)) return
    setUsersBusy(true)
    try {
      const result = await adminApi(`/admin/users/${member.user_id}/password-reset`, { method: 'POST' }) as { email: string }
      setNotice(`Password reset email sent to ${result.email}.`)
      await loadAudit()
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Failed to send password reset email.')
    } finally {
      setUsersBusy(false)
    }
  }

  const requestOwnPasswordReset = async () => {
    if (!supabase || !loginEmail.trim()) {
      setNotice('Enter your account email first.')
      return
    }
    setPasswordBusy(true)
    setNotice('')
    const { error } = await supabase.auth.resetPasswordForEmail(loginEmail.trim(), {
      redirectTo: `${window.location.origin}/admin`,
    })
    setNotice(error
      ? error.message
      : 'If this email belongs to an account, a password reset link has been sent.')
    setPasswordBusy(false)
  }

  const saveAccountPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase) return
    if (newPassword.length < 8) {
      setNotice('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setNotice('The password confirmation does not match.')
      return
    }
    setPasswordBusy(true)
    setNotice('')
    const { data, error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setNotice(error.message)
    } else {
      setNotice('Password updated successfully.')
      setPasswordRecovery(false)
      setNewPassword('')
      setConfirmPassword('')
      if (data.user) await verifyAdmin(data.user)
    }
    setPasswordBusy(false)
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

  const renderPasswordForm = (recovery: boolean) => <form className="admin-password-form" onSubmit={saveAccountPassword}>
    <label>New password<input type="password" autoComplete="new-password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /></label>
    <label>Confirm new password<input type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></label>
    <button className="contact-button" type="submit" disabled={passwordBusy}>{passwordBusy ? 'UPDATING…' : 'UPDATE PASSWORD'}</button>
    {recovery && <p>After updating, you will return to the CMS if your account has admin access.</p>}
  </form>

  if (!supabase) return <AdminShell><p>Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY.</p></AdminShell>

  if (passwordRecovery && user) return <AdminShell>
    <p className="section-kicker">ACCOUNT RECOVERY</p>
    <h1>SET A NEW PASSWORD</h1>
    <p>Choose a new password for {user.email}.</p>
    {notice && <p className="admin-notice" role="status">{notice}</p>}
    {renderPasswordForm(true)}
  </AdminShell>

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
          <label>Email address<input type="email" name="email" autoComplete="username" placeholder="nama@email.com" value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} required /></label>
          <label>Password<input type="password" name="password" autoComplete="current-password" placeholder="Masukkan password" required /></label>
          <button className="contact-button" type="submit" disabled={busy}>{busy ? 'SIGNING IN…' : 'SIGN IN'} <span aria-hidden="true">↗</span></button>
          <button className="admin-password-reset-link" type="button" disabled={passwordBusy} onClick={() => void requestOwnPasswordReset()}>{passwordBusy ? 'SENDING RESET EMAIL…' : 'Forgot password?'}</button>
        </form>
        <p className="admin-login-security">Akses dashboard memerlukan akun admin terdaftar.</p>
      </section>
    </div>
    <a className="admin-login-back" href="/">← KEMBALI KE PORTOFOLIO</a>
  </main>

  return <AdminShell>
    <p className="section-kicker">PRIVATE AREA / ADMIN</p>
    <h1>PORTFOLIO CMS</h1>
    {!authorized ? <>
      {checkingAdmin
        ? <div className="admin-verifying" role="status"><span className="admin-verifying__spinner" aria-hidden="true" /> Verifying admin access…</div>
        : <>{notice && <p className="admin-notice" role="alert">{notice}</p>}<button className="outline-button" onClick={() => void supabase?.auth.signOut()}>SIGN OUT</button></>}
    </> : <>
      <div className="admin-toolbar"><p>Signed in as {user.email}</p><div><a href="/" target="_blank" rel="noreferrer">VIEW SITE ↗</a><button className="outline-button" onClick={() => void supabase?.auth.signOut()}>SIGN OUT</button></div></div>
      <div className="admin-cms">
        <nav className="admin-cms-nav" aria-label="CMS menu">
          <p className="admin-cms-nav__label">WORKSPACE</p>
          {adminMenus.filter((menu) => adminRole === 'owner' || (menu.id !== 'users' && menu.id !== 'audit')).map((menu) => <button key={menu.id} type="button" className={activeMenu === menu.id ? 'is-active' : ''} aria-current={activeMenu === menu.id ? 'page' : undefined} onClick={() => selectMenu(menu.id)}>
            <span className="admin-cms-nav__index">{menu.index}</span><span>{menu.label}</span>
            {menu.id === 'messages' && messages.some((message) => !message.read_at) && <span className="admin-cms-nav__badge">{messages.filter((message) => !message.read_at).length}</span>}
          </button>)}
          <p className="admin-cms-nav__footer">PORTFOLIO CMS<br />CONTENT MANAGEMENT</p>
        </nav>
        <div className="admin-cms-content">
          <header className="admin-cms-heading"><div><p>CMS / WORKSPACE</p><h2>{adminMenus.find((menu) => menu.id === activeMenu)?.label}</h2></div><span>CONTENT IS LIVE</span></header>
          {notice && <p className="admin-notice" role="status">{notice}</p>}

          {activeMenu === 'dashboard' && <>
            <section className="admin-dashboard-stats" aria-label="Portfolio overview">
              <article><span>PROJECTS</span><strong>{projects.length}</strong><small>{projects.filter((project) => project.status === 'published').length} published</small></article>
              <article><span>MEDIA ASSETS</span><strong>{media.length}</strong><small>Images and video</small></article>
              <article><span>NEW MESSAGES</span><strong>{messages.filter((message) => !message.read_at).length}</strong><small>Waiting for review</small></article>
              <article><span>CV STATUS</span><strong>{cvPublishedAt ? 'LIVE' : 'DRAFT'}</strong><small>{cvPublishedAt ? 'Published version active' : 'Not published yet'}</small></article>
            </section>
            <section className="admin-dashboard-quick"><div><p className="section-kicker">QUICK ACCESS</p><h3>Manage your portfolio</h3><p>Pilih area yang ingin dikelola. Setiap bagian memiliki menu dan ruang kerja tersendiri.</p></div>
              <div>{adminMenus.filter((menu) => menu.id !== 'dashboard' && (adminRole === 'owner' || (menu.id !== 'users' && menu.id !== 'audit'))).map((menu) => <button type="button" key={menu.id} onClick={() => selectMenu(menu.id)}><span>{menu.index} / {menu.label}</span><span aria-hidden="true">↗</span></button>)}</div>
            </section>
          </>}

          {activeMenu === 'account' && <section className="admin-section admin-cms-panel admin-account-panel">
            <div className="admin-panel-heading"><div><h2>MY ACCOUNT</h2><p>Manage your own CMS sign-in credentials.</p></div><span>{adminRole.toUpperCase()}</span></div>
            <p className="admin-account-email">{user.email}</p>
            {passwordRecovery && <p className="admin-users-note">You opened a password reset link. Set a new password below.</p>}
            {renderPasswordForm(false)}
          </section>}

          {activeMenu === 'settings' && <section className="admin-section admin-cms-panel">
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
          </section>}

          {activeMenu === 'cv' && <CvBuilder draft={cvDraft} publishedAt={cvPublishedAt} busy={cvBusy} onDraftChange={setCvDraft} onSave={() => void saveCvDraft()} onPublish={() => void publishCvDraft()} />}

          {activeMenu === 'projects' && <>
            <section className="admin-section admin-cms-panel">
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
            <section className="admin-section admin-cms-panel"><h2>PROJECTS ({projects.length})</h2><div className="admin-project-list">
              {projects.map((project) => <article className="admin-project-row" key={project.id}>
                <div><span>{project.status.toUpperCase()} / {project.category}</span><h3>{project.title}</h3><small>/{project.slug}</small></div>
                <div className="admin-row-actions"><button className="outline-button" onClick={() => { setEditingId(project.id); setForm({ ...project }); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>EDIT</button><button className="outline-button" onClick={() => void removeProject(project)}>DELETE</button></div>
              </article>)}
            </div></section>
          </>}

          {activeMenu === 'media' && <section className="admin-section admin-cms-panel">
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
              <div className="admin-row-actions">{asset.media_type === 'image' && <button className="outline-button" onClick={() => { setForm((current) => ({ ...current, image_url: asset.public_url, image_alt: asset.alt_text })); setEditingId(null); selectMenu('projects') }}>USE FOR PROJECT</button>}<button className="outline-button" onClick={() => void removeMedia(asset)}>DELETE</button></div>
            </article>)}</div>
          </section>}

          {activeMenu === 'messages' && <section className="admin-section admin-cms-panel"><h2>CONTACT MESSAGES ({messages.filter((message) => !message.read_at).length} NEW)</h2><div className="admin-message-list">
            {messages.length === 0 ? <p>Belum ada pesan.</p> : messages.map((message) => <article className="admin-message-row" key={message.id}>
              <div className="admin-message-meta"><span>{message.read_at ? 'READ' : 'NEW'} / {new Date(message.created_at).toLocaleString()}</span><h3>{message.name}</h3><a href={`mailto:${message.email}`}>{message.email}</a></div>
              <p>{message.message}</p>
              <div className="admin-row-actions"><button className="outline-button" onClick={() => void setMessageRead(message, !message.read_at)}>{message.read_at ? 'MARK UNREAD' : 'MARK READ'}</button><button className="outline-button" onClick={() => void removeMessage(message)}>DELETE</button></div>
            </article>)}
          </div></section>}

          {activeMenu === 'users' && adminRole === 'owner' && <section className="admin-section admin-cms-panel admin-users-panel">
            <div className="admin-panel-heading"><div><h2>CMS USERS</h2><p>Invite admins and control access to portfolio content.</p></div><span>{adminMembers.length} MEMBERS</span></div>
            <form className="admin-user-invite" onSubmit={inviteAdmin}>
              <label>Invite administrator<input type="email" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="name@example.com" maxLength={254} required /></label>
              <button className="contact-button" type="submit" disabled={usersBusy}>{usersBusy ? 'SENDING…' : 'INVITE ADMIN'}</button>
            </form>
            <p className="admin-users-note">New email addresses receive a Supabase invitation. Existing Supabase accounts get CMS access directly. Admins cannot manage users or audit records.</p>
            <div className="admin-data-table-wrap"><table className="admin-data-table">
              <thead><tr><th>User</th><th>Role</th><th>Status</th><th>Last sign-in</th><th>Access added</th><th>Account actions</th></tr></thead>
              <tbody>{adminMembers.map((member) => <tr key={member.user_id}>
                <td><strong>{member.email}</strong><small>{member.user_id}</small></td>
                <td><span className={`admin-role-pill admin-role-pill--${member.role}`}>{member.role}</span>{member.user_id === user?.id && <small>YOU</small>}</td>
                <td><span className={`admin-status-pill admin-status-pill--${member.status}`}>{member.status}</span></td>
                <td>{member.last_sign_in_at ? new Date(member.last_sign_in_at).toLocaleString() : '—'}</td>
                <td>{new Date(member.created_at).toLocaleDateString()}</td>
                <td><div className="admin-row-actions admin-user-actions"><button className="outline-button" type="button" disabled={usersBusy} onClick={() => void sendAdminPasswordReset(member)}>SEND RESET</button>{member.role === 'admin' && <button className="outline-button admin-danger-button" type="button" disabled={usersBusy} onClick={() => void revokeAdminAccess(member)}>REVOKE ACCESS</button>}</div></td>
              </tr>)}</tbody>
            </table></div>
            {usersBusy && adminMembers.length === 0 && <p className="admin-table-empty" role="status">Loading users…</p>}
            {!usersBusy && adminMembers.length === 0 && <p className="admin-table-empty">No CMS users found.</p>}
          </section>}

          {activeMenu === 'audit' && adminRole === 'owner' && <section className="admin-section admin-cms-panel admin-audit-panel">
            <div className="admin-panel-heading"><div><h2>AUDIT TRAIL</h2><p>Successful content and access changes, newest first.</p></div><span>{auditTotal} EVENTS</span></div>
            <p className="admin-users-note">Request payloads and contact message contents are never copied into this log.</p>
            {auditBusy && <p className="admin-table-empty" role="status">Loading audit events…</p>}
            <div className="admin-data-table-wrap"><table className="admin-data-table admin-audit-table">
              <thead><tr><th>Action</th><th>Actor</th><th>Target</th><th>Request</th><th>When</th></tr></thead>
              <tbody>{auditEvents.map((entry) => <tr key={entry.id}>
                <td><span className="admin-audit-action">{entry.action.replaceAll('.', ' ')}</span></td>
                <td><strong>{entry.actor_email}</strong><small>{entry.actor_user_id}</small></td>
                <td><span>{entry.entity}</span><small>{entry.entity_id ?? '—'}</small></td>
                <td><span>{entry.metadata.method ?? '—'}</span><small>{entry.metadata.route ?? '—'}</small></td>
                <td>{new Date(entry.created_at).toLocaleString()}</td>
              </tr>)}</tbody>
            </table></div>
            {!auditBusy && auditEvents.length === 0 && <p className="admin-table-empty">No recorded changes yet.</p>}
            <div className="admin-audit-pagination"><span>Showing {auditTotal ? auditOffset + 1 : 0}–{Math.min(auditOffset + auditEvents.length, auditTotal)} of {auditTotal}</span><div><button className="outline-button" type="button" disabled={auditBusy || auditOffset === 0} onClick={() => void loadAudit(Math.max(0, auditOffset - 50))}>NEWER</button><button className="outline-button" type="button" disabled={auditBusy || auditOffset + 50 >= auditTotal} onClick={() => void loadAudit(auditOffset + 50)}>OLDER</button></div></div>
          </section>}
        </div>
      </div>
    </>}
  </AdminShell>
}

function AdminShell({ children }: Readonly<{ children: ReactNode }>) {
  return <main className="admin-shell"><a className="hero-brand" href="/">JW<span>.</span></a>{children}</main>
}
