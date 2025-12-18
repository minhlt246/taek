import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsBoolean,
  IsNumber,
  MinLength,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  ho_va_ten: string;

  @IsOptional()
  @ValidateIf((o) => o.email !== undefined && o.email !== null && o.email !== '')
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  ma_hoi_vien?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  ma_hv?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  phone?: string;

  @IsOptional()
  @IsDateString()
  ngay_thang_nam_sinh?: string;

  @IsOptional()
  @IsEnum(['Nam', 'Nữ'])
  gioi_tinh?: 'Nam' | 'Nữ';

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsBoolean()
  active_status?: boolean;

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
  @IsNumber()
  cap_dai_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  emergency_contact_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  emergency_contact_phone?: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @MaxLength(255)
  password: string;
}
