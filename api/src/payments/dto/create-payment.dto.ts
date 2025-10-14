import {
  IsNumber,
  IsOptional,
  IsEnum,
  IsString,
  IsDateString,
} from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  user_id: number;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsDateString()
  payment_date?: string;

  @IsOptional()
  @IsNumber()
  month?: number;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsEnum(['paid', 'pending', 'late'])
  status?: 'paid' | 'pending' | 'late';

  @IsOptional()
  @IsString()
  note?: string;
}
