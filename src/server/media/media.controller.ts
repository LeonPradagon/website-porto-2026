import { Body, Controller, Delete, Get, Inject, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common'
import type { Request } from 'express'
import { AdminGuard } from '../auth/admin.guard'
import { MediaService } from './media.service'

type AdminRequest = Request & { adminUserId: string; adminAccessToken: string }

@Controller('admin/media')
@UseGuards(AdminGuard)
export class MediaController {
  constructor(@Inject(MediaService) private readonly media: MediaService) {}

  @Get()
  list() {
    return this.media.list()
  }

  @Post()
  register(@Body() body: unknown, @Req() request: AdminRequest) {
    return this.media.register(body, request.adminUserId)
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string, @Req() request: AdminRequest) {
    return this.media.remove(id, request.adminAccessToken)
  }
}
