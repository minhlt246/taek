import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateScheduleDto {
  @IsNumber()
  @IsOptional()
  courseId?: number;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  dayOfWeek: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;
}
