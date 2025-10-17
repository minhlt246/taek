import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsEnum(['general', 'payment', 'event', 'course', 'promotion'])
  type?: 'general' | 'payment' | 'event' | 'course' | 'promotion';

  @IsOptional()
  @IsEnum(['all', 'students', 'coaches', 'admins', 'HLV'])
  target_audience?: 'all' | 'students' | 'coaches' | 'admins' | 'HLV';

  @IsOptional()
  @IsInt()
  @Min(1)
  club_id?: number;

  @IsOptional()
  @IsBoolean()
  is_urgent?: boolean;

  @IsOptional()
  @IsDateString()
  published_at?: string;

  @IsOptional()
  @IsDateString()
  expires_at?: string;
}
