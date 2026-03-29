import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Progress, ProgressDocument, SkillStatus } from './progress.schema';

@Injectable()
export class ProgressService {

  constructor(
    @InjectModel(Progress.name)
    private readonly progressModel: Model<ProgressDocument>,
  ) {}

  // Called right after analysis/run — initializes the tracker
  async initializeProgress(
    userId: string,
    targetRole: string,
    initialScore: number,
    missingSkills: string[],
  ): Promise<ProgressDocument> {

    // Check if progress already exists for this user
    const existing = await this.progressModel
      .findOne({ userId })
      .exec();

    if (existing) {
      // Update with new analysis results
      existing.targetRole    = targetRole;
      existing.currentScore  = initialScore;
      existing.previousScore = existing.currentScore;
      existing.skills        = missingSkills.map(skill => ({
        skill,
        status:      SkillStatus.NOT_STARTED,
        startedAt:   null,
        completedAt: null,
        daysSpent:   0,
      }));
      return existing.save();
    }

    // First time — create fresh progress tracker
    const progress = new this.progressModel({
      userId,
      targetRole,
      currentScore:  initialScore,
      previousScore: initialScore,
      streak:        0,
      lastActivityDate: null,
      totalCompleted: 0,
      skills: missingSkills.map(skill => ({
        skill,
        status:      SkillStatus.NOT_STARTED,
        startedAt:   null,
        completedAt: null,
        daysSpent:   0,
      })),
    });

    return progress.save();
  }

  // Update a skill's status (in_progress or completed)
  async updateSkillStatus(
    userId: string,
    skill: string,
    status: string,
  ): Promise<ProgressDocument> {

    const progress = await this.findByUserId(userId);

    // Find the skill in the tracker
    const skillEntry = progress.skills.find(
      s => s.skill === skill.toLowerCase().trim()
    );

    if (!skillEntry) {
      throw new NotFoundException(
        `Skill "${skill}" not found in your roadmap`
      );
    }

    const validStatuses = Object.values(SkillStatus) as string[];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(
        `Status must be one of: ${validStatuses.join(', ')}`
      );
    }

    const now = new Date();

    // Update skill state
    if (status === SkillStatus.IN_PROGRESS && !skillEntry.startedAt) {
      skillEntry.startedAt = now;
    }

    if (status === SkillStatus.COMPLETED && !skillEntry.completedAt) {
      skillEntry.completedAt = now;
      progress.totalCompleted += 1;

      // Recalculate score improvement
      // Each completed required skill adds points
      progress.previousScore = progress.currentScore;
      const pointsPerSkill   = Math.round(70 / Math.max(progress.skills.length, 1));
      progress.currentScore  = Math.min(
        100,
        progress.currentScore + pointsPerSkill
      );
    }

    skillEntry.status = status as SkillStatus;

    // Update streak logic
    progress.streak          = this.calculateStreak(progress.lastActivityDate, progress.streak);
    progress.lastActivityDate = now;

    // Mongoose needs this to detect nested object changes
    progress.markModified('skills');

    return progress.save();
  }

  // Get full progress dashboard for a user
  async getProgress(userId: string): Promise<{
    summary:   object;
    skills:    object[];
    streak:    number;
    scoreGain: number;
  }> {
    const progress = await this.findByUserId(userId);

    const completed   = progress.skills.filter(s => s.status === SkillStatus.COMPLETED).length;
    const inProgress  = progress.skills.filter(s => s.status === SkillStatus.IN_PROGRESS).length;
    const notStarted  = progress.skills.filter(s => s.status === SkillStatus.NOT_STARTED).length;
    const total       = progress.skills.length;
    const percentage  = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      summary: {
        userId:        progress.userId,
        targetRole:    progress.targetRole,
        currentScore:  progress.currentScore,
        previousScore: progress.previousScore,
        scoreGain:     progress.currentScore - progress.previousScore,
        totalSkills:   total,
        completed,
        inProgress,
        notStarted,
        completionPercentage: percentage,
        streak:        progress.streak,
        lastActivity:  progress.lastActivityDate,
      },
      skills:    progress.skills,
      streak:    progress.streak,
      scoreGain: progress.currentScore - progress.previousScore,
    };
  }

  async findByUserId(userId: string): Promise<ProgressDocument> {
    const progress = await this.progressModel
      .findOne({ userId })
      .exec();

    if (!progress) {
      throw new NotFoundException(
        `No progress tracker found for user ${userId}. Run analysis first.`
      );
    }

    return progress;
  }

  // Streak: if user was active yesterday → increment, today → keep, else reset
  private calculateStreak(
    lastActivity: Date | null,
    currentStreak: number,
  ): number {
    if (!lastActivity) return 1;   // first ever activity

    const now       = new Date();
    const last      = new Date(lastActivity);
    const diffMs    = now.getTime() - last.getTime();
    const diffDays  = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return currentStreak;       // already active today
    if (diffDays === 1) return currentStreak + 1;   // active yesterday — streak continues
    return 1;                                        // gap — streak resets
  }
}