import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { ResumeService } from '../resume/resume.service';
import { RoadmapService } from '../roadmap/roadmap.service';
import { UsersService } from '../users/users.service';
import { RolesService } from '../roles/roles.service';
import { ProgressService } from '../progress/progress.service';
import { RunAnalysisDto } from '../../common/dto/run-analysis.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('analysis')
@Controller('analysis')
export class AnalysisController {

  constructor(
    private readonly analysisService: AnalysisService,
    private readonly resumeService: ResumeService,
    private readonly roadmapService: RoadmapService,
    private readonly usersService: UsersService,
    private readonly rolesService: RolesService,
    private readonly progressService: ProgressService,
  ) { }

  @Post('run')
  @ApiOperation({ summary: 'Run analysis on user resume against target role' })
  @ApiResponse({ status: 200, description: 'Analysis completed successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - invalid input' })
  @ApiResponse({ status: 404, description: 'User or resume not found' })
  async runAnalysis(@Body() dto: RunAnalysisDto) {

    const resume = await this.resumeService.findLatestByUserId(dto.userId);
    if (!resume) {
      return { message: 'No resume found. Please upload a resume first.' };
    }

    const analysis = await this.analysisService.analyze(
      resume.detectedSkills,
      dto.targetRole,
    );

    const roadmap = await this.roadmapService.generateRoadmap(
      analysis.missing,
      analysis.missingNiceToHave,
      dto.targetRole,
    );

    await this.usersService.saveAnalysis(dto.userId, {
      score: analysis.score,
      matched: analysis.matched,
      missing: analysis.missing,
    });

    // Auto-initialize progress tracker with missing skills
    await this.progressService.initializeProgress(
      dto.userId,
      dto.targetRole,
      analysis.score,
      [...analysis.missing, ...analysis.missingNiceToHave],
    );

    return {
      userId: dto.userId,
      resumeId: resume._id,
      targetRole: dto.targetRole,
      servedFromCache: analysis.fromCache,
      analysis,
      roadmap,
      message: 'Progress tracker initialized. Use GET /api/progress/:userId to view.',
    };
  }

  @Get('explain')
  @ApiOperation({ summary: 'Explain a target role' })
  @ApiQuery({ name: 'role', example: 'cardiac surgeon' })
  @ApiResponse({ status: 200, description: 'Role explanation retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request - missing role query parameter' })
  async explainRole(@Query('role') role: string) {
    if (!role) return { error: 'Provide ?role=your role title' };
    return this.rolesService.explainRole(role);
  }
}