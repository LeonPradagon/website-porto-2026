import { Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'
import { AdminAuditInterceptor } from './admin-audit.interceptor'
import { AuditModule } from './audit/audit.module'
import { DatabaseModule } from './database.module'
import { ContactModule } from './contact/contact.module'
import { HealthModule } from './health/health.module'
import { ProjectsModule } from './projects/projects.module'
import { SeoModule } from './seo/seo.module'
import { SettingsModule } from './settings/settings.module'
import { MediaModule } from './media/media.module'
import { CvModule } from './cv/cv.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [DatabaseModule, HealthModule, ProjectsModule, ContactModule, SeoModule, SettingsModule, MediaModule, CvModule, UsersModule, AuditModule],
  providers: [{ provide: APP_INTERCEPTOR, useClass: AdminAuditInterceptor }],
})
export class AppModule {}
