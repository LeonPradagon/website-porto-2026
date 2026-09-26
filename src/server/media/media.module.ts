import { Module } from '@nestjs/common'
import { AdminGuard } from '../auth/admin.guard'
import { MediaController } from './media.controller'
import { MediaService } from './media.service'

@Module({
  controllers: [MediaController],
  providers: [AdminGuard, MediaService],
})
export class MediaModule {}
