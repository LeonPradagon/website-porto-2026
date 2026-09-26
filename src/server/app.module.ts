import { Module } from '@nestjs/common'
import { DatabaseModule } from './database.module'
import { ContactModule } from './contact/contact.module'
import { HealthModule } from './health/health.module'
import { ProjectsModule } from './projects/projects.module'
import { SeoModule } from './seo/seo.module'
import { SettingsModule } from './settings/settings.module'
import { MediaModule } from './media/media.module'
import { CvModule } from './cv/cv.module'

@Module({
  imports: [DatabaseModule, HealthModule, ProjectsModule, ContactModule, SeoModule, SettingsModule, MediaModule, CvModule],
})
export class AppModule {}
