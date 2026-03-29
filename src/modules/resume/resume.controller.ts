
import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ResumeService } from './resume.service';
import { UploadResumeDto } from '../../common/dto/upload-resume.dto';
import { multerConfig } from '../../common/utils/multer.config';

@Controller('resume')
export class ResumeController {

  constructor(private readonly resumeService: ResumeService) {}

  // POST /api/resume/upload
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadResume(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadResumeDto: UploadResumeDto,
  ) {
    // Guard: ensure file was actually received
    if (!file) {
      throw new BadRequestException('PDF file is required');
    }

    const result = await this.resumeService.processResume(
      file,
      uploadResumeDto.userId,
      uploadResumeDto.targetRole,
    );

    // Return clean response (not the raw DB document)
    return {
      message: 'Resume processed successfully',
      resumeId: result._id,
      fileName: result.originalFileName,
      detectedSkills: result.detectedSkills,
      skillCount: result.detectedSkills.length,
      targetRole: result.targetRole,
    };
  }

  // GET /api/resume/user/:userId
  @Get('user/:userId')
  async getResumesByUser(@Param('userId') userId: string) {
    return this.resumeService.findByUserId(userId);
  }

  // GET /api/resume/user/:userId/latest
  @Get('user/:userId/latest')
  async getLatestResume(@Param('userId') userId: string) {
    return this.resumeService.findLatestByUserId(userId);
  }
}
