import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTuitionPackageDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  duration_months?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  classes_per_week?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  club_id?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
