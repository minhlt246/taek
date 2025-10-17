import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateLearningProgressDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  user_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  course_id?: number;

  @IsOptional()
  @IsDateString()
  lesson_date?: string;

  @IsOptional()
  @IsString()
  lesson_content?: string;

  @IsOptional()
  @IsString()
  skills_learned?: string;

  @IsOptional()
  @IsString()
  homework?: string;

  @IsOptional()
  @IsString()
  coach_notes?: string;
}
