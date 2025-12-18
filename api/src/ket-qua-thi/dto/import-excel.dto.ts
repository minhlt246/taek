import { IsOptional, IsNumber } from 'class-validator';

export class ImportExcelDto {
  @IsOptional()
  @IsNumber()
  test_id?: number;
}

