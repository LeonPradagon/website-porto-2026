import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common'
import { DatabaseService } from '../database.service'

@Injectable()
export class DatabaseHealthService {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  async check(): Promise<void> {
    try {
      await this.database.sql`select 1`
    } catch {
      throw new ServiceUnavailableException('Database is unavailable')
    }
  }
}
