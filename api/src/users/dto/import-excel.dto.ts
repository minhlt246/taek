import { IsOptional, IsNumber } from 'class-validator';

export class ImportExcelDto {
  @IsOptional()
  @IsNumber()
  club_id?: number;
}

