import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateScheduleDto {
  @IsNumber()
  club_id: number;

  @IsNumber()
  branch_id: number;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  day_of_week: string;

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
