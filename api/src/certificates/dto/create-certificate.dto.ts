import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCertificateDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  user_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  belt_level_id?: number;

  @IsString()
  @MaxLength(50)
  certificate_number: string;

  @IsOptional()
  @IsDateString()
  issue_date?: string;

  @IsOptional()
  @IsDateString()
  expiry_date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  issued_by?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  certificate_image_url?: string;

  @IsOptional()
  @IsBoolean()
  is_valid?: boolean;
}
