import { Injectable, ServiceUnavailableException } from '@nestjs/common'
import postgres from 'postgres'

@Injectable()
export class DatabaseHealthService {
  private readonly sqlUrl = process.env.SUPABASE_DB_RUNTIME_URL ?? process.env.SUPABASE_DB_URL
  private readonly sql = this.sqlUrl
    ? postgres(this.sqlUrl, {
        max: 1,
        prepare: false,
        ssl: 'require',
        connect_timeout: 5,
        idle_timeout: 20,
      })
    : null

  async check(): Promise<void> {
    if (!this.sql) {
      throw new ServiceUnavailableException('Database is not configured')
    }

    try {
      await this.sql`select 1`
    } catch {
      throw new ServiceUnavailableException('Database is unavailable')
    }
  }
}
