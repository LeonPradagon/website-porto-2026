import { Body, Controller, Get, Inject, Put, UseGuards } from '@nestjs/common'
import { AdminGuard } from '../auth/admin.guard'
import { SettingsService } from './settings.service'

@Controller('settings')
export class PublicSettingsController {
  constructor(@Inject(SettingsService) private readonly settings: SettingsService) {}

  @Get()
  get() {
    return this.settings.getPublicSettings()
  }
}

@Controller('admin/settings')
@UseGuards(AdminGuard)
export class AdminSettingsController {
  constructor(@Inject(SettingsService) private readonly settings: SettingsService) {}

  @Put()
  update(@Body() body: unknown) {
    return this.settings.update(body)
  }
}
