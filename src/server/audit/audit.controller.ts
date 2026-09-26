import { BadRequestException, Controller, DefaultValuePipe, Get, Inject, ParseIntPipe, Query, UseGuards } from '@nestjs/common'
import { AdminGuard } from '../auth/admin.guard'
import { OwnerGuard } from '../auth/owner.guard'
import { DatabaseService } from '../database.service'

@Controller('admin/audit')
@UseGuards(AdminGuard, OwnerGuard)
export class AuditController {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  @Get()
  async list(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ) {
    if (limit < 1 || limit > 100 || offset < 0 || offset > 100_000) {
      throw new BadRequestException('limit must be 1–100 and offset must be between 0 and 100000')
    }
    const [{ total }] = await this.database.sql`select count(*)::int as total from public.admin_audit_logs`
    const items = await this.database.sql`
      select id, actor_user_id, actor_email, action, entity, entity_id, metadata, created_at
      from public.admin_audit_logs
      order by created_at desc, id desc
      limit ${limit} offset ${offset}
    `
    return { items, total, limit, offset }
  }
}
