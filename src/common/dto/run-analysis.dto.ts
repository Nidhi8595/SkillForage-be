import { IsNotEmpty, IsString } from 'class-validator';

export class RunAnalysisDto {

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  resumeId!: string;

  @IsString()
  @IsNotEmpty()
  targetRole!: string;
}