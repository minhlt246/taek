import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBeltTestDto {
  @IsString()
  @MaxLength(100)
  test_name: string;

  @IsOptional()
  @IsDateString()
  test_date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  examiner_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  club_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  max_participants?: number;

  @IsOptional()
  @IsDateString()
  registration_deadline?: string;

  @IsOptional()
  @IsNumber()
  test_fee?: number;

  @IsOptional()
  @IsEnum(['upcoming', 'ongoing', 'completed', 'cancelled'])
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}
