import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Request } from 'express'
import { DatabaseService } from '../database.service'

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly authClient: SupabaseClient | null

  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {
    const url = process.env.VITE_SUPABASE_URL
    const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY
    this.authClient = url && key ? createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    }) : null
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.authClient) throw new ServiceUnavailableException('Authentication is not configured')

    const request = context.switchToHttp().getRequest<Request & { adminUserId?: string; adminUserEmail?: string; adminRole?: 'owner' | 'admin'; adminAccessToken?: string }>()
    const authorization = request.headers.authorization
    const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1]
    if (!token) throw new UnauthorizedException('Bearer token required')

    const { data, error } = await this.authClient.auth.getUser(token)
    if (error || !data.user) throw new UnauthorizedException('Invalid or expired token')

    const [membership] = await this.database.sql`
      select role from public.site_admins where user_id = ${data.user.id}::uuid limit 1
    `
    if (!membership) throw new ForbiddenException('Admin access required')
    request.adminUserId = data.user.id
    request.adminUserEmail = data.user.email ?? data.user.id
    request.adminRole = membership.role
    request.adminAccessToken = token
    return true
  }
}
