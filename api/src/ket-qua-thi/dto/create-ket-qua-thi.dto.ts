import {
  IsOptional,
  IsNumber,
  IsString,
  IsEnum,
  IsDateString,
  MaxLength,
  Min,
  Max,
} from 'class-validator';

export class CreateKetQuaThiDto {
  @IsOptional()
  @IsNumber()
  test_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  ma_clb?: string;

  @IsOptional()
  @IsNumber()
  user_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  ma_hoi_vien?: string;

  @IsOptional()
  @IsNumber()
  cap_dai_du_thi_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  so_thi?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ho_va_ten?: string;

  @IsOptional()
  @IsEnum(['Nam', 'Nữ'])
  gioi_tinh?: 'Nam' | 'Nữ';

  @IsOptional()
  @IsDateString()
  ngay_thang_nam_sinh?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  ky_thuat_tan_can_ban?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  nguyen_tac_phat_luc?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  can_ban_tay?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  ky_thuat_chan?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  can_ban_tu_ve?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  bai_quyen?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  phan_the_bai_quyen?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  song_dau?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  the_luc?: number;

  @IsOptional()
  @IsEnum(['Đạt', 'Không đạt', 'Chưa có kết quả'])
  ket_qua?: 'Đạt' | 'Không đạt' | 'Chưa có kết quả';

  @IsOptional()
  @IsString()
  ghi_chu?: string;
}

