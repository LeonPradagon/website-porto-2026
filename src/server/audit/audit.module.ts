import { Module } from '@nestjs/common'
import { AdminGuard } from '../auth/admin.guard'
import { OwnerGuard } from '../auth/owner.guard'
import { AuditController } from './audit.controller'

@Module({
  controllers: [AuditController],
  providers: [AdminGuard, OwnerGuard],
})
export class AuditModule {}
