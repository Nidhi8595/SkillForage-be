import { Injectable } from '@nestjs/common';
import { RolesService } from '../roles/roles.service';

export interface AnalysisResult {
  score: number;
  matched: string[];
  missing: string[];
  missingNiceToHave: string[];
  strengths: string[];
  totalRequired: number;
  totalMatched: number;
  fromCache: boolean;
  breakdown: {
    requiredScore: number;
    bonusScore: number;
  };
}

@Injectable()
export class AnalysisService {

  constructor(private readonly rolesService: RolesService) {}

  // Now async because getRoleBenchmark calls Claude if not cached
  async analyze(
    resumeSkills: string[],
    targetRole: string,
  ): Promise<AnalysisResult> {

    const benchmark = await this.rolesService.getRoleBenchmark(targetRole);

    const matchedRequired = benchmark.required.filter(s =>
      resumeSkills.includes(s)
    );
    const missingRequired = benchmark.required.filter(s =>
      !resumeSkills.includes(s)
    );
    const matchedBonus = benchmark.good_to_have.filter(s =>
      resumeSkills.includes(s)
    );
    const missingBonus = benchmark.good_to_have.filter(s =>
      !resumeSkills.includes(s)
    );

    const requiredScore = benchmark.required.length > 0
      ? (matchedRequired.length / benchmark.required.length) * 70
      : 0;

    const bonusScore = benchmark.good_to_have.length > 0
      ? (matchedBonus.length / benchmark.good_to_have.length) * 30
      : 0;

    return {
      score: Math.round(requiredScore + bonusScore),
      matched: [...matchedRequired, ...matchedBonus],
      missing: missingRequired,
      missingNiceToHave: missingBonus,
      strengths: matchedRequired,
      totalRequired: benchmark.required.length,
      totalMatched: matchedRequired.length,
      fromCache: benchmark.fromCache,
      breakdown: {
        requiredScore: Math.round(requiredScore),
        bonusScore: Math.round(bonusScore),
      },
    };
  }
}