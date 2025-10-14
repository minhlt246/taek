import {
  IsNumber,
  IsOptional,
  IsEnum,
  IsString,
  IsDateString,
} from 'class-validator';

export class CreateEnrollmentDto {
  @IsNumber()
  user_id: number;

  @IsNumber()
  course_id: number;

  @IsOptional()
  @IsEnum(['pending', 'approved', 'rejected'])
  status?: 'pending' | 'approved' | 'rejected';

  @IsOptional()
  @IsDateString()
  approved_at?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
