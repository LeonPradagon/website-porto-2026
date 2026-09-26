import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService } from '../database.service'

export type ProjectInput = {
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

const projectColumns = `id, slug, title, category, description, role, year, stack, image_url, image_alt, demo_url, repository_url, editorial, featured, status, sort_order, created_at, updated_at`

@Injectable()
export class ProjectsService {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  async listPublished() {
    return this.database.sql.unsafe(`select ${projectColumns} from public.projects where status = 'published' order by sort_order, created_at`)
  }

  async findPublished(slug: string) {
    const [project] = await this.database.sql`
      select ${this.database.sql.unsafe(projectColumns)} from public.projects
      where slug = ${slug} and status = 'published' limit 1
    `
    if (!project) throw new NotFoundException('Project not found')
    return project
  }

  async listAdmin() {
    return this.database.sql.unsafe(`select ${projectColumns} from public.projects order by sort_order, created_at`)
  }

  async create(input: ProjectInput) {
    try {
      const [project] = await this.database.sql`
        insert into public.projects (slug, title, category, description, role, year, stack, image_url, image_alt, demo_url, repository_url, editorial, featured, status, sort_order)
        values (${input.slug}, ${input.title}, ${input.category}, ${input.description}, ${input.role}, ${input.year}, ${input.stack}, ${input.image_url}, ${input.image_alt}, ${input.demo_url}, ${input.repository_url}, ${input.editorial}, ${input.featured}, ${input.status}, ${input.sort_order})
        returning ${this.database.sql.unsafe(projectColumns)}
      `
      return project
    } catch (error) {
      this.throwDatabaseError(error)
    }
  }

  async update(id: string, input: ProjectInput) {
    try {
      const [project] = await this.database.sql`
        update public.projects set slug = ${input.slug}, title = ${input.title}, category = ${input.category},
          description = ${input.description}, role = ${input.role}, year = ${input.year}, stack = ${input.stack}, image_url = ${input.image_url}, image_alt = ${input.image_alt},
          demo_url = ${input.demo_url}, repository_url = ${input.repository_url}, editorial = ${input.editorial}, featured = ${input.featured}, status = ${input.status},
          sort_order = ${input.sort_order}, updated_at = now()
        where id = ${id}::uuid
        returning ${this.database.sql.unsafe(projectColumns)}
      `
      if (!project) throw new NotFoundException('Project not found')
      return project
    } catch (error) {
      this.throwDatabaseError(error)
    }
  }

  async remove(id: string) {
    const [project] = await this.database.sql`
      delete from public.projects where id = ${id}::uuid returning id
    `
    if (!project) throw new NotFoundException('Project not found')
    return { deleted: true }
  }

  private throwDatabaseError(error: unknown): never {
    if (error instanceof BadRequestException || error instanceof ConflictException || error instanceof NotFoundException) throw error
    const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined
    if (code === '23505') throw new ConflictException('Project slug already exists')
    if (code === '23514' || code === '22P02') throw new BadRequestException('Project data is invalid')
    throw error
  }
}

export function validateProjectInput(value: unknown): ProjectInput {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new BadRequestException('Project body must be an object')
  const body = value as Record<string, unknown>
  const text = (key: string, max: number) => {
    const item = body[key]
    if (typeof item !== 'string' || !item.trim() || item.trim().length > max) throw new BadRequestException(`${key} is required and must be at most ${max} characters`)
    return item.trim()
  }

  const slug = text('slug', 100)
  const title = text('title', 200)
  const category = body.category
  const status = body.status
  const description = text('description', 10000)
  const role = typeof body.role === 'string' ? body.role.trim() : ''
  const year = body.year === '' || body.year === null || body.year === undefined ? null : body.year
  const stack = body.stack
  const imageUrl = text('image_url', 2048)
  const imageAlt = typeof body.image_alt === 'string' ? body.image_alt.trim() : ''
  const demoUrl = typeof body.demo_url === 'string' && body.demo_url.trim() ? body.demo_url.trim() : null
  const repositoryUrl = text('repository_url', 2048)
  const editorial = body.editorial
  const featured = body.featured
  const sortOrder = body.sort_order

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new BadRequestException('slug format is invalid')
  if (category !== 'Professional' && category !== 'Personal') throw new BadRequestException('category is invalid')
  if (status !== 'draft' && status !== 'published') throw new BadRequestException('status is invalid')
  if (!Array.isArray(stack) || stack.length > 30 || stack.some((item) => typeof item !== 'string' || !item.trim() || item.length > 80)) throw new BadRequestException('stack must be an array of up to 30 short strings')
  if (!(imageUrl.startsWith('/assets/') || isHttpsUrl(imageUrl))) throw new BadRequestException('image_url must use /assets/ or HTTPS')
  if (imageAlt.length > 500) throw new BadRequestException('image_alt must be at most 500 characters')
  if (role.length > 200) throw new BadRequestException('role must be at most 200 characters')
  if (year !== null && (!Number.isSafeInteger(year) || (year as number) < 1990 || (year as number) > 2100)) throw new BadRequestException('year must be a year between 1990 and 2100')
  if (demoUrl !== null && !isHttpsUrl(demoUrl)) throw new BadRequestException('demo_url must use HTTPS')
  if (!isHttpsUrl(repositoryUrl)) throw new BadRequestException('repository_url must use HTTPS')
  if (typeof editorial !== 'boolean') throw new BadRequestException('editorial must be boolean')
  if (typeof featured !== 'boolean') throw new BadRequestException('featured must be boolean')
  if (!Number.isSafeInteger(sortOrder) || (sortOrder as number) < 0) throw new BadRequestException('sort_order must be a non-negative integer')

  return { slug, title, category, description, role, year: year as number | null, stack: stack.map((item) => (item as string).trim()), image_url: imageUrl, image_alt: imageAlt, demo_url: demoUrl, repository_url: repositoryUrl, editorial, featured, status, sort_order: sortOrder as number }
}

function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}
