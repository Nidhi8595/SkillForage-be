import { IsNotEmpty, IsString } from 'class-validator';

export class UploadResumeDto {

  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  targetRole!: string; // e.g. "backend developer"
}