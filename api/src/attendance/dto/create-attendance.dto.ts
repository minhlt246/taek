import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateAttendanceDto {
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
  attendance_date?: string;

  @IsOptional()
  @IsEnum(['present', 'absent', 'late', 'excused'])
  status?: 'present' | 'absent' | 'late' | 'excused';

  @IsOptional()
  @IsString()
  notes?: string;
}
