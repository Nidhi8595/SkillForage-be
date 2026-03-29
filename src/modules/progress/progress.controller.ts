import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { UpdateSkillProgressDto } from 'src/common/dto/update-skill-progress.dto';

class InitDto {
  userId!: string;
  targetRole!: string;
  initialScore!: number;
  missingSkills!: string[];
}

class UpdateDto {
  skill!: string;
  status!: string;
}

@Controller('progress')
export class ProgressController {

  constructor(private readonly progressService: ProgressService) {}

  // POST /api/progress/init
  // Called automatically by analysis/run — can also call manually
  @Post('init')
  async init(@Body() body: InitDto) {
    return this.progressService.initializeProgress(
      body.userId,
      body.targetRole,
      body.initialScore,
      body.missingSkills,
    );
  }

  // GET /api/progress/:userId
  // Full progress dashboard
  @Get(':userId')
  async getProgress(@Param('userId') userId: string) {
    return this.progressService.getProgress(userId);
  }

  // PATCH /api/progress/:userId/skill
  // Update a skill status
  @Patch(':userId/skill')
  async updateSkill(
    @Param('userId') userId: string,
    @Body() body: UpdateSkillProgressDto,
  ) {
    return this.progressService.updateSkillStatus(
      userId,
      body.skill,
      body.status,
    );
  }
}