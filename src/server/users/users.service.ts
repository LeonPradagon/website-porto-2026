import { BadRequestException, ConflictException, Inject, Injectable, ServiceUnavailableException } from '@nestjs/common'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { DatabaseService } from '../database.service'

@Injectable()
export class UsersService {
  private readonly authAdmin: SupabaseClient | null
  private readonly authPublic: SupabaseClient | null

  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {
    const url = process.env.VITE_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY
    const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
    this.authAdmin = url && key ? createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    }) : null
    this.authPublic = url && publishableKey ? createClient(url, publishableKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    }) : null
  }

  listUsers() {
    return this.database.sql`
      select admins.user_id, users.email, admins.role, admins.created_at,
        users.last_sign_in_at,
        case when users.email_confirmed_at is null then 'invited' else 'active' end as status
      from public.site_admins as admins
      join auth.users as users on users.id = admins.user_id
      order by case admins.role when 'owner' then 0 else 1 end, admins.created_at desc
    `
  }

  async inviteOrGrantAccess(value: unknown) {
    const email = validateAdminEmail(value)
    const [existingAuthUser] = await this.database.sql`
      select id from auth.users where lower(email) = ${email} limit 1
    `

    if (existingAuthUser) {
      const [existingMembership] = await this.database.sql`
        select 1 from public.site_admins where user_id = ${existingAuthUser.id}::uuid limit 1
      `
      if (existingMembership) throw new ConflictException('This user already has CMS access')
      await this.database.sql`
        insert into public.site_admins (user_id, role) values (${existingAuthUser.id}::uuid, 'admin')
      `
      return { user_id: existingAuthUser.id, email, role: 'admin', invitation_sent: false }
    }

    if (!this.authAdmin) {
      throw new ServiceUnavailableException('Set SUPABASE_SERVICE_ROLE_KEY on the server to invite new users')
    }
    const { data, error } = await this.authAdmin.auth.admin.inviteUserByEmail(email)
    if (error) throw new BadRequestException(`Supabase could not send the invitation: ${error.message}`)
    const userId = data.user?.id
    if (!userId) throw new ServiceUnavailableException('Supabase created no user for the invitation')

    try {
      await this.database.sql`
        insert into public.site_admins (user_id, role) values (${userId}::uuid, 'admin')
      `
    } catch (error) {
      await this.authAdmin.auth.admin.deleteUser(userId).catch(() => undefined)
      throw error
    }
    return { user_id: userId, email, role: 'admin', invitation_sent: true }
  }

  async revokeAccess(userId: string) {
    const [member] = await this.database.sql`
      select role from public.site_admins where user_id = ${userId}::uuid limit 1
    `
    if (!member) throw new BadRequestException('CMS user not found')
    if (member.role === 'owner') throw new BadRequestException('Owner access cannot be revoked from this screen')

    const [removed] = await this.database.sql`
      delete from public.site_admins where user_id = ${userId}::uuid and role = 'admin'
      returning user_id
    `
    if (!removed) throw new BadRequestException('CMS access was not changed')
    return { user_id: removed.user_id, revoked: true }
  }

  async sendPasswordReset(userId: string) {
    if (!this.authPublic) {
      throw new ServiceUnavailableException('Supabase public authentication is not configured')
    }
    const siteUrl = process.env.VITE_SITE_URL ?? process.env.DEPLOY_PRIME_URL ?? process.env.URL
    if (!siteUrl) {
      throw new ServiceUnavailableException('Set VITE_SITE_URL so password recovery returns to the admin screen')
    }

    const [member] = await this.database.sql`
      select users.email from public.site_admins as admins
      join auth.users as users on users.id = admins.user_id
      where admins.user_id = ${userId}::uuid limit 1
    `
    if (!member?.email) throw new BadRequestException('CMS user not found')

    let redirectTo: string
    try {
      redirectTo = new URL('/admin', siteUrl).toString()
    } catch {
      throw new ServiceUnavailableException('VITE_SITE_URL must be a valid HTTP or HTTPS URL')
    }
    if (!/^https?:\/\//i.test(redirectTo)) {
      throw new ServiceUnavailableException('VITE_SITE_URL must be a valid HTTP or HTTPS URL')
    }

    const { error } = await this.authPublic.auth.resetPasswordForEmail(member.email, { redirectTo })
    if (error) throw new BadRequestException(`Supabase could not send the password reset email: ${error.message}`)
    return { user_id: userId, email: member.email, sent: true }
  }
}

function validateAdminEmail(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || typeof (value as Record<string, unknown>).email !== 'string') {
    throw new BadRequestException('email is required')
  }
  const email = (value as { email: string }).email.trim().toLowerCase()
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new BadRequestException('A valid email address is required')
  }
  return email
}
