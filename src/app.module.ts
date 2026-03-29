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

import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
     // 1. Config Module — loads .env globally
    ConfigModule.forRoot({
      isGlobal: true,      // available in ALL modules without re-importing
      envFilePath: '.env', // path to your .env file
    }),

    // 2. MongoDB Connection — async so it waits for ConfigService
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    
    UsersModule, ResumeModule, SkillsModule, RolesModule, AnalysisModule, RoadmapModule, ProgressModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
