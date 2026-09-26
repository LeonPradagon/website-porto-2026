import { Module } from '@nestjs/common'
import { AdminGuard } from '../auth/admin.guard'
import { AdminCvController, PublicCvController } from './cv.controller'
import { CvService } from './cv.service'

@Module({
  controllers: [PublicCvController, AdminCvController],
  providers: [AdminGuard, CvService],
})
export class CvModule {}
