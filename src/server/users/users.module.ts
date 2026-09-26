import { Module } from '@nestjs/common'
import { AdminGuard } from '../auth/admin.guard'
import { OwnerGuard } from '../auth/owner.guard'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
  controllers: [UsersController],
  providers: [AdminGuard, OwnerGuard, UsersService],
})
export class UsersModule {}
