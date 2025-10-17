import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateStudentEvaluationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  user_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  coach_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  course_id?: number;

  @IsOptional()
  @IsDateString()
  evaluation_date?: string;

  @IsOptional()
  @IsNumber()
  technique_score?: number;

  @IsOptional()
  @IsNumber()
  attitude_score?: number;

  @IsOptional()
  @IsNumber()
  progress_score?: number;

  @IsOptional()
  @IsNumber()
  overall_score?: number;

  @IsOptional()
  @IsString()
  comments?: string;
}
