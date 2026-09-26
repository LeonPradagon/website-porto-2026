import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

type ProjectRow = {
  id: string
  slug: string
  title: string
  category: 'Professional' | 'Personal'
  description: string
  stack: string[]
  image_url: string
  repository_url: string
  editorial: boolean
  status: 'draft' | 'published'
  sort_order: number
}

const emptyProject: Omit<ProjectRow, 'id'> = {
  slug: '', title: '', category: 'Professional', description: '', stack: [],
  image_url: '', repository_url: '', editorial: false, status: 'draft', sort_order: 0,
}

export const Route = createFileRoute('/admin')({ component: Admin })

function Admin() {
  const [user, setUser] = useState<User | null>(null)
  const [authorized, setAuthorized] = useState(false)
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [form, setForm] = useState(emptyProject)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const loadProjects = async () => {
    if (!supabase) return
    const { data, error } = await supabase.from('projects').select('*').order('sort_order')
    if (error) setNotice(error.message)
    else setProjects(data as ProjectRow[])
  }

  const verifyAdmin = async (currentUser: User | null) => {
    setUser(currentUser)
    if (!supabase || !currentUser) {
      setAuthorized(false)
      setProjects([])
      return
    }
    const { data, error } = await supabase.from('site_admins').select('user_id').eq('user_id', currentUser.id).maybeSingle()
    if (error) {
      setNotice(error.message)
      setAuthorized(false)
      return
    }
    setAuthorized(Boolean(data))
    if (data) await loadProjects()
    else setNotice('Akun ini belum tercatat sebagai admin situs.')
  }

  useEffect(() => {
    if (!supabase) return
    void supabase.auth.getSession().then(({ data }) => verifyAdmin(data.session?.user ?? null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session) {
        setAuthorized(false)
        setProjects([])
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
    else await verifyAdmin(data.user)
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
      stack: String(values.get('stack')).split(',').map((item) => item.trim()).filter(Boolean),
      image_url: String(values.get('image_url')).trim(),
      repository_url: String(values.get('repository_url')).trim(),
      editorial: values.get('editorial') === 'on',
      status: String(values.get('status')),
      sort_order: Number(values.get('sort_order')) || 0,
    }
    setBusy(true)
    const request = editingId
      ? supabase.from('projects').update(project).eq('id', editingId)
      : supabase.from('projects').insert(project)
    const { error } = await request
    setNotice(error ? error.message : 'Proyek berhasil disimpan.')
    if (!error) {
      setForm(emptyProject)
      setEditingId(null)
      await loadProjects()
    }
    setBusy(false)
  }

  const removeProject = async (project: ProjectRow) => {
    if (!supabase || !window.confirm(`Hapus proyek “${project.title}”?`)) return
    const { error } = await supabase.from('projects').delete().eq('id', project.id)
    setNotice(error ? error.message : 'Proyek dihapus.')
    if (!error) await loadProjects()
  }

  if (!supabase) return <AdminShell><p>Supabase belum dikonfigurasi. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY.</p></AdminShell>

  return <AdminShell>
    <p className="section-kicker">PRIVATE AREA / ADMIN</p>
    <h1>PORTFOLIO CMS</h1>
    {notice && <p className="admin-notice" role="status">{notice}</p>}
    {!user ? <form className="admin-login" onSubmit={signIn}>
      <label>Email<input type="email" name="email" autoComplete="username" required /></label>
      <label>Password<input type="password" name="password" autoComplete="current-password" required /></label>
      <button className="contact-button" type="submit" disabled={busy}>{busy ? 'SIGNING IN…' : 'SIGN IN'}</button>
    </form> : !authorized ? <button className="outline-button" onClick={() => void supabase?.auth.signOut()}>SIGN OUT</button> : <>
      <div className="admin-toolbar"><p>Signed in as {user.email}</p><button className="outline-button" onClick={() => void supabase?.auth.signOut()}>SIGN OUT</button></div>
      <section className="admin-section">
        <h2>{editingId ? 'EDIT PROJECT' : 'ADD PROJECT'}</h2>
        <form className="admin-project-form" onSubmit={saveProject}>
          <label>Title<input name="title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></label>
          <label>Slug<input name="slug" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} pattern="[a-z0-9]+(-[a-z0-9]+)*" required /></label>
          <label>Category<select name="category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as ProjectRow['category'] })}><option>Professional</option><option>Personal</option></select></label>
          <label>Status<select name="status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as ProjectRow['status'] })}><option value="draft">Draft</option><option value="published">Published</option></select></label>
          <label className="admin-project-form__wide">Description<textarea name="description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required /></label>
          <label>Tech stack<input name="stack" value={form.stack.join(', ')} onChange={(event) => setForm({ ...form, stack: event.target.value.split(',').map((item) => item.trim()) })} placeholder="React, TypeScript" /></label>
          <label>Image URL<input name="image_url" type="text" pattern="(https://|/assets/).*" value={form.image_url} onChange={(event) => setForm({ ...form, image_url: event.target.value })} required /></label>
          <label>Repository URL<input name="repository_url" type="url" value={form.repository_url} onChange={(event) => setForm({ ...form, repository_url: event.target.value })} pattern="https://.*" required /></label>
          <label>Order<input name="sort_order" type="number" min="0" value={form.sort_order} onChange={(event) => setForm({ ...form, sort_order: Number(event.target.value) })} /></label>
          <label className="admin-check"><input name="editorial" type="checkbox" checked={form.editorial} onChange={(event) => setForm({ ...form, editorial: event.target.checked })} /> Editorial asset</label>
          <div className="admin-form-actions"><button className="contact-button" type="submit" disabled={busy}>{busy ? 'SAVING…' : 'SAVE PROJECT'}</button>{editingId && <button className="outline-button" type="button" onClick={() => { setForm(emptyProject); setEditingId(null) }}>CANCEL</button>}</div>
        </form>
      </section>
      <section className="admin-section"><h2>PROJECTS ({projects.length})</h2><div className="admin-project-list">
        {projects.map((project) => <article className="admin-project-row" key={project.id}>
          <div><span>{project.status.toUpperCase()} / {project.category}</span><h3>{project.title}</h3><small>/{project.slug}</small></div>
          <div className="admin-row-actions"><button className="outline-button" onClick={() => { setEditingId(project.id); setForm({ ...project }) }}>EDIT</button><button className="outline-button" onClick={() => void removeProject(project)}>DELETE</button></div>
        </article>)}
      </div></section>
    </>}
  </AdminShell>
}

function AdminShell({ children }: Readonly<{ children: ReactNode }>) {
  return <main className="admin-shell"><a className="hero-brand" href="/">JW<span>.</span></a>{children}</main>
}
