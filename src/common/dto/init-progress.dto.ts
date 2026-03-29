import { IsNotEmpty, IsString, IsNumber, IsArray } from 'class-validator';

export class InitProgressDto {

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  targetRole!: string;

  @IsNumber()
  initialScore!: number;

  @IsArray()
  missingSkills!: string[];   // skills user needs to learn
}