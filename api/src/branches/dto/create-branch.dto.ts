import {
  IsString,
  IsOptional,
  IsNumber,
  IsEmail,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateBranchDto {
  @IsNumber()
  club_id: number;

  @IsString()
  @MinLength(2)
  @MaxLength(20)
  branch_code: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;
}
