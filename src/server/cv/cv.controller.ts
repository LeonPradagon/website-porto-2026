import { Body, Controller, Get, Inject, Post, Put, UseGuards } from '@nestjs/common'
import { AdminGuard } from '../auth/admin.guard'
import { CvService } from './cv.service'

@Controller('cv')
export class PublicCvController {
  constructor(@Inject(CvService) private readonly cv: CvService) {}

  @Get('public')
  getPublished() {
    return this.cv.getPublished()
  }
}

@Controller('admin/cv')
@UseGuards(AdminGuard)
export class AdminCvController {
  constructor(@Inject(CvService) private readonly cv: CvService) {}

  @Get()
  getDraft() {
    return this.cv.getDraft()
  }

  @Put()
  updateDraft(@Body() body: unknown) {
    return this.cv.updateDraft(body)
  }

  @Post('publish')
  publish() {
    return this.cv.publish()
  }
}
