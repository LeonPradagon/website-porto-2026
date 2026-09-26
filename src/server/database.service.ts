import { Injectable, OnModuleDestroy, ServiceUnavailableException } from '@nestjs/common'
import postgres from 'postgres'

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private client: ReturnType<typeof postgres> | null = null

  get sql() {
    const url = process.env.SUPABASE_DB_RUNTIME_URL ?? process.env.SUPABASE_DB_URL
    if (!url) throw new ServiceUnavailableException('Database is not configured')
    this.client ??= postgres(url, {
      max: 1,
      prepare: false,
      ssl: 'require',
      connect_timeout: 5,
      idle_timeout: 20,
    })
    return this.client
  }

  async onModuleDestroy() {
    await this.client?.end()
  }
}
