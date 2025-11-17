import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  level?: 'beginner' | 'intermediate' | 'advanced';

  @IsOptional()
  @IsEnum(['Q1', 'Q2', 'Q3', 'Q4'])
  quarter?: 'Q1' | 'Q2' | 'Q3' | 'Q4';

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsNumber()
  coach_id?: number;

  @IsOptional()
  @IsNumber()
  club_id?: number;

  @IsOptional()
  @IsNumber()
  branch_id?: number;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsNumber()
  current_students?: number;

  // Note: max_students, price, instructor_name, training_time, training_days
  // are not in the database schema, so they are removed from the DTO.
  // If needed, add these columns to the database first.

  @IsOptional()
  @IsString()
  @MaxLength(255)
  image_url?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
