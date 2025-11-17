import {
  IsString,
  IsOptional,
  IsEmail,
  IsNumber,
  IsBoolean,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateCoachDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  ho_va_ten?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  ma_hoi_vien?: string;

  @IsOptional()
  @IsString()
  ngay_thang_nam_sinh?: string; // Date format: YYYY-MM-DD

  @IsOptional()
  @IsString()
  @MaxLength(20)
  ma_clb?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  ma_don_vi?: string;

  @IsOptional()
  @IsNumber()
  quyen_so?: number;

  @IsOptional()
  @IsEnum(['Nam', 'Nữ'])
  gioi_tinh?: 'Nam' | 'Nữ';

  @IsOptional()
  @IsString()
  @MaxLength(255)
  photo_url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  phone?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  password?: string;

  @IsOptional()
  @IsEnum(['owner', 'admin'])
  role?: 'owner' | 'admin';

  @IsOptional()
  @IsNumber()
  belt_level_id?: number;

  @IsOptional()
  @IsNumber()
  experience_years?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  specialization?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  emergency_contact_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  emergency_contact_phone?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
