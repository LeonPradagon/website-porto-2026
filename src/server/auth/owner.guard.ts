import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import type { Request } from 'express'

@Injectable()
export class OwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request & { adminRole?: string }>()
    if (request.adminRole !== 'owner') throw new ForbiddenException('Owner access required')
    return true
  }
}
