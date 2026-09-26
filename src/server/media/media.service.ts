import { createClient } from '@supabase/supabase-js'
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common'
import { DatabaseService } from '../database.service'

const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4', 'video/webm'])
const extensionByMime: Record<string, string[]> = {
  'image/jpeg': ['jpg', 'jpeg'],
  'image/png': ['png'],
  'image/webp': ['webp'],
  'image/avif': ['avif'],
  'video/mp4': ['mp4'],
  'video/webm': ['webm'],
}

@Injectable()
export class MediaService {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  list() {
    return this.database.sql`
      select id, storage_path, public_url, media_type, mime_type, size_bytes, alt_text, created_at
      from public.media_assets order by created_at desc limit 300
    `
  }

  async register(value: unknown, adminUserId: string) {
    const input = validateAsset(value, adminUserId)
    const [stored] = await this.database.sql`
      select name from storage.objects where bucket_id='portfolio-media' and name=${input.storage_path} limit 1
    `
    if (!stored) throw new BadRequestException('Uploaded file was not found in storage')

    const baseUrl = process.env.VITE_SUPABASE_URL
    if (!baseUrl) throw new ServiceUnavailableException('Supabase URL is not configured')
    const origin = new URL(baseUrl).origin
    const publicUrl = `${origin}/storage/v1/object/public/portfolio-media/${input.storage_path.split('/').map(encodeURIComponent).join('/')}`

    try {
      const [asset] = await this.database.sql`
        insert into public.media_assets (storage_path, public_url, media_type, mime_type, size_bytes, alt_text, created_by)
        values (${input.storage_path}, ${publicUrl}, ${input.media_type}, ${input.mime_type}, ${input.size_bytes}, ${input.alt_text}, ${adminUserId}::uuid)
        returning id, storage_path, public_url, media_type, mime_type, size_bytes, alt_text, created_at
      `
      return asset
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
        throw new ConflictException('This file is already in the media library')
      }
      throw error
    }
  }

  async remove(id: string, accessToken: string) {
    const [asset] = await this.database.sql`
      select id, storage_path, public_url from public.media_assets where id=${id}::uuid limit 1
    `
    if (!asset) throw new NotFoundException('Media asset not found')

    const [project] = await this.database.sql`
      select slug from public.projects where image_url=${asset.public_url} limit 1
    `
    if (project) throw new ConflictException(`Replace or remove this asset from project "${project.slug}" before deleting it`)

    const url = process.env.VITE_SUPABASE_URL
    const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
    if (!url || !key) throw new ServiceUnavailableException('Supabase Storage is not configured')
    const storage = createClient(url, key, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { error } = await storage.storage.from('portfolio-media').remove([asset.storage_path])
    if (error) throw new ConflictException('Storage could not delete this file. Check bucket permissions and try again.')

    await this.database.sql`delete from public.media_assets where id=${id}::uuid`
    return { deleted: true }
  }
}

function validateAsset(value: unknown, adminUserId: string) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new BadRequestException('Media metadata must be an object')
  const body = value as Record<string, unknown>
  const storagePath = typeof body.storage_path === 'string' ? body.storage_path.trim() : ''
  const mimeType = typeof body.mime_type === 'string' ? body.mime_type : ''
  const sizeBytes = body.size_bytes
  const altText = typeof body.alt_text === 'string' ? body.alt_text.trim() : ''
  if (!storagePath.startsWith(`${adminUserId}/`) || storagePath.includes('..') || storagePath.length > 512) {
    throw new BadRequestException('Storage path is invalid')
  }
  if (!allowedMimeTypes.has(mimeType)) throw new BadRequestException('This media format is not supported')
  if (!Number.isSafeInteger(sizeBytes) || (sizeBytes as number) < 1 || (sizeBytes as number) > 50 * 1024 * 1024) {
    throw new BadRequestException('File size exceeds the 50 MB limit')
  }
  if (!altText || altText.length > 500) throw new BadRequestException('Alt text or video description must be 1 to 500 characters')
  const extension = storagePath.split('.').at(-1)?.toLowerCase()
  if (!extension || !extensionByMime[mimeType].includes(extension)) throw new BadRequestException('File extension does not match its media type')
  return {
    storage_path: storagePath,
    mime_type: mimeType,
    media_type: mimeType.startsWith('image/') ? 'image' : 'video',
    size_bytes: sizeBytes as number,
    alt_text: altText,
  }
}
