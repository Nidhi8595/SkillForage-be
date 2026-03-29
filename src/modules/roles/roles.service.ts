import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GroqService } from './groq.service';
import { RoleBenchmark, RoleBenchmarkDocument } from './role-benchmark.schema';

export interface BenchmarkResult {
  required: string[];
  good_to_have: string[];
  all: string[];
  fromCache: boolean;
  roleName: string;
}

@Injectable()
export class RolesService {

  private readonly logger = new Logger(RolesService.name);

  constructor(
    @InjectModel(RoleBenchmark.name)
    private readonly benchmarkModel: Model<RoleBenchmarkDocument>,
    private readonly groqService: GroqService,
  ) {}

  async getRoleBenchmark(roleName: string): Promise<BenchmarkResult> {
    const normalized = roleName.toLowerCase().trim();

    // Always check MongoDB cache first — instant and free
    const cached = await this.benchmarkModel
      .findOne({ roleName: normalized })
      .exec();

    if (cached) {
      this.logger.log(`Cache HIT: "${normalized}"`);
      return {
        required: cached.required,
        good_to_have: cached.good_to_have,
        all: [...cached.required, ...cached.good_to_have],
        fromCache: true,
        roleName: normalized,
      };
    }

    // Cache miss — call Groq (free, fast)
    this.logger.log(`Cache MISS: "${normalized}" — calling Groq`);
    const benchmark = await this.groqService
      .generateSkillBenchmark(normalized);

    // Save to MongoDB — never call Groq for this role again
    await this.benchmarkModel.create({
      roleName: normalized,
      required: benchmark.required,
      good_to_have: benchmark.good_to_have,
    });

    this.logger.log(
      `Cached "${normalized}" — ${benchmark.required.length} required, ${benchmark.good_to_have.length} bonus`
    );

    return {
      required: benchmark.required,
      good_to_have: benchmark.good_to_have,
      all: [...benchmark.required, ...benchmark.good_to_have],
      fromCache: false,
      roleName: normalized,
    };
  }

  async explainRole(roleName: string) {
    const benchmark = await this.getRoleBenchmark(roleName);
    return {
      role: roleName,
      fromCache: benchmark.fromCache,
      totalSkills: benchmark.all.length,
      benchmark,
    };
  }

  isValidRole(_roleName: string): boolean {
    return true;
  }
}