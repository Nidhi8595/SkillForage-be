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
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

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

@ApiTags('progress')
@Controller('progress')
export class ProgressController {

  constructor(private readonly progressService: ProgressService) { }

  // POST /api/progress/init
  // Called automatically by analysis/run — can also call manually
  @Post('init')
  @ApiOperation({ summary: 'Initialize progress for a user' })
  @ApiResponse({ status: 201, description: 'Progress initialized successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - invalid input' })
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
  @ApiOperation({ summary: 'Get progress for a user' })
  @ApiParam({ name: 'userId', description: 'MongoDB user ID' })
  @ApiResponse({ status: 200, description: 'Progress retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getProgress(@Param('userId') userId: string) {
    return this.progressService.getProgress(userId);
  }

  // PATCH /api/progress/:userId/skill
  // Update a skill status
  @Patch(':userId/skill')
  @ApiOperation({ summary: 'Update skill status for a user' })
  @ApiParam({ name: 'userId', description: 'MongoDB user ID' })
  @ApiResponse({ status: 200, description: 'Skill status updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - invalid input' })
  @ApiResponse({ status: 404, description: 'User not found' })
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