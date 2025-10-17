import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateFeedbackDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  user_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  course_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  coach_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsEnum(['course', 'coach', 'facility', 'general'])
  feedback_type?: 'course' | 'coach' | 'facility' | 'general';

  @IsOptional()
  @IsBoolean()
  is_anonymous?: boolean;
}
