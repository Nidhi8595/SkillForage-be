import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResumeController } from './resume.controller';
import { ResumeService } from './resume.service';
import { PdfParserService } from './pdf-parser.service';
import { Resume, ResumeSchema } from './resume.schema';
import { SkillsModule } from '../skills/skills.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Resume.name, schema: ResumeSchema }
    ]),
    SkillsModule,  // need SkillsService
    UsersModule,   // need UsersService
  ],
  controllers: [ResumeController],
  providers: [ResumeService, PdfParserService],
  exports: [ResumeService],
})
export class ResumeModule {}