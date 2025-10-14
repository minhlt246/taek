import { IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateStudentParentDto {
  @IsNumber()
  student_id: number;

  @IsNumber()
  parent_id: number;

  @IsOptional()
  @IsBoolean()
  is_primary?: boolean;
}
