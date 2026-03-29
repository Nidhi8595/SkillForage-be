import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateSkillProgressDto {

  @IsString()
  @IsNotEmpty()
  skill!: string;        // which skill

  @IsString()
  @IsNotEmpty()
  status!: string;       // "in_progress" or "completed"
}