import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name!: string; // ← add ! (definite assignment assertion)

  @IsEmail()
  @IsNotEmpty()
  email!: string; // ← add ! (definite assignment assertion)
}