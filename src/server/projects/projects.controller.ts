import { Body, Controller, Delete, Get, Inject, Param, ParseUUIDPipe, Post, Put, UseGuards } from '@nestjs/common'
import { AdminGuard } from '../auth/admin.guard'
import { ProjectsService, validateProjectInput } from './projects.service'

@Controller('projects')
export class ProjectsController {
  constructor(@Inject(ProjectsService) private readonly projects: ProjectsService) {}

  @Get()
  listPublished() {
    return this.projects.listPublished()
  }

  @Get(':slug')
  findPublished(@Param('slug') slug: string) {
    return this.projects.findPublished(slug)
  }
}

@Controller('admin/projects')
@UseGuards(AdminGuard)
export class AdminProjectsController {
  constructor(@Inject(ProjectsService) private readonly projects: ProjectsService) {}

  @Get()
  list() {
    return this.projects.listAdmin()
  }

  @Post()
  create(@Body() body: unknown) {
    return this.projects.create(validateProjectInput(body))
  }

  @Put(':id')
  update(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: unknown) {
    return this.projects.update(id, validateProjectInput(body))
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.projects.remove(id)
  }
}

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  @Get('me')
  checkAccess() {
    return { authorized: true }
  }
}
