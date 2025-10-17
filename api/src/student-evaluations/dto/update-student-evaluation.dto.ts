import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentEvaluationDto } from './create-student-evaluation.dto';

export class UpdateStudentEvaluationDto extends PartialType(
  CreateStudentEvaluationDto,
) {}
