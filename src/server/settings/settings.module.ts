import { Module } from '@nestjs/common'
import { AdminGuard } from '../auth/admin.guard'
import { AdminSettingsController, PublicSettingsController } from './settings.controller'
import { SettingsService } from './settings.service'

@Module({
  controllers: [PublicSettingsController, AdminSettingsController],
  providers: [AdminGuard, SettingsService],
})
export class SettingsModule {}
