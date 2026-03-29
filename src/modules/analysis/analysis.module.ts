import { Module } from '@nestjs/common';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { RolesModule } from '../roles/roles.module';
import { ResumeModule } from '../resume/resume.module';
import { RoadmapModule } from '../roadmap/roadmap.module';
import { UsersModule } from '../users/users.module';
import { ProgressModule } from '../progress/progress.module';

@Module({
  imports: [
    RolesModule,
    ResumeModule,
    RoadmapModule,
    UsersModule,
    ProgressModule,
  ],
  controllers: [AnalysisController],
  providers: [AnalysisService],
})
export class AnalysisModule {}