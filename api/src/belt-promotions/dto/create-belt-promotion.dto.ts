import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateBeltPromotionDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  user_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  from_belt_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  to_belt_id?: number;

  @IsOptional()
  @IsDateString()
  promotion_date?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  coach_id?: number;

  @IsOptional()
  @IsNumber()
  test_score?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
