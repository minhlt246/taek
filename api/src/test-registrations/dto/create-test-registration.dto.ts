import {
  IsNumber,
  IsOptional,
  IsEnum,
  IsString,
  IsDateString,
  Min,
  Max,
} from 'class-validator';

export class CreateTestRegistrationDto {
  @IsNumber()
  test_id: number;

  @IsNumber()
  user_id: number;

  @IsNumber()
  current_belt_id: number;

  @IsNumber()
  target_belt_id: number;

  @IsOptional()
  @IsDateString()
  registration_date?: string;

  @IsOptional()
  @IsEnum(['paid', 'pending'])
  payment_status?: 'paid' | 'pending';

  @IsOptional()
  @IsEnum(['pass', 'fail', 'pending'])
  test_result?: 'pass' | 'fail' | 'pending';

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;

  @IsOptional()
  @IsString()
  examiner_notes?: string;
}

