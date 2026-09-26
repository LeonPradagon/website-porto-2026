import { createHmac } from 'node:crypto'
import { BadRequestException, HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common'
import type { Request } from 'express'
import { DatabaseService } from '../database.service'

type ContactInput = { name: string; email: string; message: string }

@Injectable()
export class ContactService {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  async submit(input: ContactInput, request: Request) {
    const ip = request.headers['x-nf-client-connection-ip']
    const address = typeof ip === 'string' ? ip : request.ip || 'unknown'
    const secret = process.env.CONTACT_RATE_LIMIT_SALT ?? process.env.SUPABASE_DB_RUNTIME_URL ?? process.env.SUPABASE_DB_URL
    if (!secret) throw new Error('Rate limit hashing is not configured')
    const keyHash = createHmac('sha256', secret).update(address).digest('hex')

    await this.database.sql`
      delete from public.contact_rate_limits
      where window_started_at < now() - interval '30 days'
    `
    const [limit] = await this.database.sql`
      insert into public.contact_rate_limits (key_hash, window_started_at, request_count)
      values (${keyHash}, now(), 1)
      on conflict (key_hash) do update set
        window_started_at = case
          when public.contact_rate_limits.window_started_at <= now() - interval '15 minutes' then now()
          else public.contact_rate_limits.window_started_at
        end,
        request_count = case
          when public.contact_rate_limits.window_started_at <= now() - interval '15 minutes' then 1
          else public.contact_rate_limits.request_count + 1
        end
      returning request_count
    `
    if (limit.request_count > 5) throw new HttpException('Too many messages. Please try again later.', HttpStatus.TOO_MANY_REQUESTS)

    const [saved] = await this.database.sql`
      insert into public.contact_messages (name, email, message)
      values (${input.name}, ${input.email}, ${input.message})
      returning id, created_at
    `
    return { sent: true, id: saved.id, created_at: saved.created_at }
  }

  listMessages() {
    return this.database.sql`
      select id, name, email, message, created_at, read_at
      from public.contact_messages
      order by (read_at is null) desc, created_at desc
      limit 200
    `
  }

  async markRead(id: string, isRead: boolean) {
    const [message] = await this.database.sql`
      update public.contact_messages set read_at = ${isRead ? new Date() : null}
      where id = ${id}::uuid returning id, read_at
    `
    if (!message) throw new NotFoundException('Message not found')
    return message
  }

  async remove(id: string) {
    const [message] = await this.database.sql`
      delete from public.contact_messages where id = ${id}::uuid returning id
    `
    if (!message) throw new NotFoundException('Message not found')
    return { deleted: true }
  }
}

export function validateContact(value: unknown): ContactInput | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new BadRequestException('Message body must be an object')
  const body = value as Record<string, unknown>

  // Honeypot: return success without storing so basic bots cannot confirm delivery behavior.
  if (typeof body.website === 'string' && body.website.trim()) return null

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  if (!name || name.length > 100) throw new BadRequestException('Name must be between 1 and 100 characters')
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new BadRequestException('A valid email address is required')
  if (!message || message.length > 4000) throw new BadRequestException('Message must be between 1 and 4000 characters')
  return { name, email, message }
}
