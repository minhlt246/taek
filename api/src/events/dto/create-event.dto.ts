import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['tournament', 'seminar', 'graduation', 'social', 'other'])
  event_type?: 'tournament' | 'seminar' | 'graduation' | 'social' | 'other';

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @IsOptional()
  @IsNumber()
  club_id?: number;

  @IsOptional()
  @IsNumber()
  registration_fee?: number;

  @IsOptional()
  @IsNumber()
  max_participants?: number;

  @IsOptional()
  @IsNumber()
  current_participants?: number;

  @IsOptional()
  @IsEnum(['upcoming', 'ongoing', 'completed', 'cancelled'])
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}
