import { Controller, Get, Inject } from '@nestjs/common'
import { DatabaseHealthService } from './database-health.service'

@Controller('health')
export class HealthController {
  constructor(@Inject(DatabaseHealthService) private readonly database: DatabaseHealthService) {}

  @Get()
  async check() {
    await this.database.check()
    return { status: 'ok', database: 'connected' }
  }
}
