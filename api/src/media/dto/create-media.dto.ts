import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsUrl,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateMediaDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  @IsUrl()
  @MaxLength(500)
  file_url: string;

  @IsEnum(['image', 'video'])
  file_type: 'image' | 'video';

  @IsOptional()
  @IsString()
  @MaxLength(100)
  mime_type?: string;

  @IsOptional()
  @IsNumber()
  file_size?: number;

  @IsOptional()
  @IsNumber()
  club_id?: number;

  @IsOptional()
  @IsNumber()
  branch_id?: number;

  @IsOptional()
  @IsNumber()
  created_by?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

