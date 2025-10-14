import {
  IsNumber,
  IsOptional,
  IsEnum,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateScheduleDto {
  @IsNumber()
  course_id: number;

  @IsEnum([
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ])
  day_of_week:
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday'
    | 'Sunday';

  @IsOptional()
  @IsString()
  start_time?: string;

  @IsOptional()
  @IsString()
  end_time?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;
}
