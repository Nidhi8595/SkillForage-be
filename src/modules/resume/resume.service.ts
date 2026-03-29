import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resume, ResumeDocument } from './resume.schema';
import { PdfParserService } from './pdf-parser.service';
import { SkillsService } from '../skills/skills.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class ResumeService {

  constructor(
    @InjectModel(Resume.name)
    private readonly resumeModel: Model<ResumeDocument>,

    private readonly pdfParserService: PdfParserService,
    private readonly skillsService: SkillsService,
    private readonly usersService: UsersService,
  ) {}

  async processResume(
    file: Express.Multer.File,
    userId: string,
    targetRole: string,
  ): Promise<ResumeDocument> {

    // Step 1: Verify user exists
    await this.usersService.findById(userId);

    // Step 2: Extract text from PDF buffer
    const extractedText = await this.pdfParserService.extractText(file.buffer);

    // Step 3: Detect skills from extracted text
    const detectedSkills = this.skillsService.extractSkills(extractedText);

    // Step 4: Save resume record to MongoDB
    const resume = new this.resumeModel({
      userId,
      originalFileName: file.originalname,
      extractedText,
      detectedSkills,
      targetRole: targetRole.toLowerCase().trim(),
    });

    const savedResume = await resume.save();

    // Step 5: Update user's uploaded resumes list
    await this.usersService.updateTargetRole(userId, targetRole);

    return savedResume;
  }

  async findByUserId(userId: string): Promise<ResumeDocument[]> {
    return this.resumeModel
      .find({ userId })
      .sort({ createdAt: -1 }) // newest first
      .exec();
  }

  async findLatestByUserId(userId: string): Promise<ResumeDocument | null> {
    return this.resumeModel
      .findOne({ userId })
      .sort({ createdAt: -1 })
      .exec();
  }
}