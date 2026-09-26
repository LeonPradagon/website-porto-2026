import { Body, Controller, Delete, Get, Inject, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common'
import { AdminGuard } from '../auth/admin.guard'
import { OwnerGuard } from '../auth/owner.guard'
import { UsersService } from './users.service'

@Controller('admin/users')
@UseGuards(AdminGuard, OwnerGuard)
export class UsersController {
  constructor(@Inject(UsersService) private readonly users: UsersService) {}

  @Get()
  list() {
    return this.users.listUsers()
  }

  @Post()
  invite(@Body() body: unknown) {
    return this.users.inviteOrGrantAccess(body)
  }

  @Delete(':id')
  revoke(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.users.revokeAccess(id)
  }

  @Post(':id/password-reset')
  sendPasswordReset(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.users.sendPasswordReset(id)
  }
}
