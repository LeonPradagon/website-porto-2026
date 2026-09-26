import { Module } from '@nestjs/common'
import { AdminGuard } from '../auth/admin.guard'
import { AdminController, AdminProjectsController, ProjectsController } from './projects.controller'
import { ProjectsService } from './projects.service'

@Module({
  controllers: [ProjectsController, AdminProjectsController, AdminController],
  providers: [AdminGuard, ProjectsService],
})
export class ProjectsModule {}
