import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { ResumeModule } from './modules/resume/resume.module';
import { SkillsModule } from './modules/skills/skills.module';
import { RolesModule } from './modules/roles/roles.module';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { RoadmapModule } from './modules/roadmap/roadmap.module';
import { ProgressModule } from './modules/progress/progress.module';

@Module({
  imports: [UsersModule, ResumeModule, SkillsModule, RolesModule, AnalysisModule, RoadmapModule, ProgressModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
