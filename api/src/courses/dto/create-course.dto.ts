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

  @IsOptional()
  @IsNumber()
  max_students?: number;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  instructor_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  training_time?: string; // Giờ tập (ví dụ: "18:00-19:30")

  @IsOptional()
  @IsString()
  @MaxLength(255)
  training_days?: string; // Buổi tập (ví dụ: "Thứ 2, 4, 6")

  @IsOptional()
  @IsString()
  @MaxLength(255)
  image_url?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
