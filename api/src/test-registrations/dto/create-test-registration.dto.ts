import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateTestRegistrationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  test_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  user_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  current_belt_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  target_belt_id?: number;

  @IsOptional()
  @IsEnum(['paid', 'pending'])
  payment_status?: 'paid' | 'pending';

  @IsOptional()
  @IsEnum(['pass', 'fail', 'pending'])
  test_result?: 'pass' | 'fail' | 'pending';

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  @IsString()
  examiner_notes?: string;
}
