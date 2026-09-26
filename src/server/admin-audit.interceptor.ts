import { Inject, Injectable, type CallHandler, type ExecutionContext, type NestInterceptor } from '@nestjs/common'
import type { Request, Response } from 'express'
import { concatMap } from 'rxjs'
import { DatabaseService } from './database.service'

type AdminRequest = Request & {
  adminUserId?: string
  adminUserEmail?: string
  route?: { path?: string }
  params: Record<string, string | undefined>
}

@Injectable()
export class AdminAuditInterceptor implements NestInterceptor {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const http = context.switchToHttp()
    const request = http.getRequest<AdminRequest>()
    const response = http.getResponse<Response>()
    const method = request.method.toUpperCase()
    const actorUserId = request.adminUserId
    if (!actorUserId || !['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return next.handle()

    const route = `${request.baseUrl ?? ''}${request.route?.path ?? request.path}`
    const entity = route.includes('/admin/projects') ? 'project'
      : route.includes('/admin/messages') ? 'message'
        : route.includes('/admin/media') ? 'media'
          : route.includes('/admin/settings') ? 'site_settings'
            : route.includes('/admin/cv') ? 'cv'
              : route.includes('/admin/users') ? 'user'
                : null
    if (!entity) return next.handle()

    const operation = entity === 'user' && method === 'DELETE' ? 'access_revoked'
      : entity === 'user' && route.endsWith('/password-reset') ? 'password_reset_sent'
        : method === 'POST' ? route.endsWith('/publish') ? 'published' : 'created'
        : method === 'DELETE' ? 'deleted' : 'updated'
    const action = `${entity}.${operation}`

    return next.handle().pipe(concatMap(async (result: unknown) => {
      const resultRecord = result && typeof result === 'object' ? result as Record<string, unknown> : {}
      const routeId = (request.params as Record<string, unknown>).id
      const entityId = (typeof routeId === 'string' ? routeId : null)
        ?? (typeof resultRecord.id === 'string' ? resultRecord.id : null)
        ?? (typeof resultRecord.user_id === 'string' ? resultRecord.user_id : null)
      const actorEmail = request.adminUserEmail ?? actorUserId
      const metadata = {
        method,
        route,
        status: response.statusCode,
      }
      try {
        await this.database.sql`
          insert into public.admin_audit_logs (actor_user_id, actor_email, action, entity, entity_id, metadata)
          values (${actorUserId}, ${actorEmail}, ${action}, ${entity}, ${entityId}, ${JSON.stringify(metadata)}::jsonb)
        `
      } catch (error) {
        console.error('Failed to persist admin audit event', { action, entityId, error })
      }
      return result
    }))
  }
}
