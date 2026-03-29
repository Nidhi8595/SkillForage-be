
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
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('resume')
@Controller('resume')
export class ResumeController {

  constructor(private readonly resumeService: ResumeService) {}

  // POST /api/resume/upload
  @Post('upload')
  @ApiOperation({summary:'Upload and process a resume PDF'})
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema:{
      type:'object',
      properties:{
        file:{type:'string',format:'binary',description:'The resume PDF file to upload'},
        userId:{type:'string',example:'64112by4757575',description:'The ID of the user uploading the resume'},
        targetRole:{type:'string',example:'software Engineer',description:'The target role for which the resume is being uploaded'}
      }
    }
  })
  @ApiResponse({status:201, description:'Resume parsed successfully'})
  @ApiResponse({status:400, description:'Bad Request - invalid input or missing file'})
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
  @ApiOperation({summary:'Get all resumes for a specific user'})
  @ApiResponse({status:200, description:'List of resumes for the user'})
  @ApiResponse({status:404, description:'User not found or no resumes available'})
  async getResumesByUser(@Param('userId') userId: string) {
    return this.resumeService.findByUserId(userId);
  }

  // GET /api/resume/user/:userId/latest
  @Get('user/:userId/latest')
  @ApiOperation({summary:'Get the latest resume for a specific user'})
  @ApiResponse({status:200, description:'Latest resume for the user'})
  @ApiResponse({status:404, description:'User not found or no resumes available'})
  async getLatestResume(@Param('userId') userId: string) {
    return this.resumeService.findLatestByUserId(userId);
  }
}
