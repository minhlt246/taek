import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePaymentDetailDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  payment_id?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  tuition_package_id?: number;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsNumber()
  discount_amount?: number;

  @IsNumber()
  final_amount: number;

  @IsOptional()
  @IsEnum(['cash', 'bank_transfer', 'card', 'other'])
  payment_method?: 'cash' | 'bank_transfer' | 'card' | 'other';

  @IsOptional()
  @IsString()
  @MaxLength(100)
  transaction_id?: string;
}
