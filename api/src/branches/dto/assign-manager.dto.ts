import { IsNumber, IsEnum, IsOptional } from 'class-validator';

export class AssignManagerDto {
  @IsNumber()
  manager_id: number;

  @IsOptional()
  @IsEnum(['main_manager', 'assistant_manager'])
  role?: 'main_manager' | 'assistant_manager';
}
