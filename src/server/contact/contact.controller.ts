import { Body, Controller, Delete, Get, Inject, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common'
import type { Request } from 'express'
import { AdminGuard } from '../auth/admin.guard'
import { ContactService, validateContact } from './contact.service'

@Controller('contact')
export class PublicContactController {
  constructor(@Inject(ContactService) private readonly contact: ContactService) {}

  @Post()
  submit(@Body() body: unknown, @Req() request: Request) {
    const input = validateContact(body)
    return input ? this.contact.submit(input, request) : { sent: true }
  }
}

@Controller('admin/messages')
@UseGuards(AdminGuard)
export class AdminMessagesController {
  constructor(@Inject(ContactService) private readonly contact: ContactService) {}

  @Get()
  list() {
    return this.contact.listMessages()
  }

  @Patch(':id/read')
  markRead(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: unknown) {
    const isRead = !!body && typeof body === 'object' && 'read' in body && (body as { read?: unknown }).read === true
    return this.contact.markRead(id, isRead)
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.contact.remove(id)
  }
}
