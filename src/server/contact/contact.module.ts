import { Module } from '@nestjs/common'
import { AdminGuard } from '../auth/admin.guard'
import { ContactService } from './contact.service'
import { AdminMessagesController, PublicContactController } from './contact.controller'

@Module({
  controllers: [PublicContactController, AdminMessagesController],
  providers: [AdminGuard, ContactService],
})
export class ContactModule {}
